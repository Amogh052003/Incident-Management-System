const crypto = require("crypto");
const axios = require("axios");
const GithubInstallation = require("../models/githubInstallation");
const RepoMapping = require("../models/repoMapping");
const IncidentIssueLink = require("../models/incidentIssueLink");

const GITHUB_API = "https://api.github.com";
const APP_ID = process.env.GITHUB_APP_ID;
const PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY
  ? Buffer.from(process.env.GITHUB_PRIVATE_KEY, "base64").toString("utf8")
  : null;
const INSTALL_URL = process.env.GITHUB_APP_INSTALL_URL;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

/**
 * Creates a short-lived RS256 JWT for GitHub App API requests.
 *
 * @returns {string|null} Signed JWT, or `null` when app credentials are unavailable.
 */
function generateJWT() {
  if (!APP_ID || !PRIVATE_KEY) return null;
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ iat: now - 60, exp: now + 600, iss: APP_ID })
  ).toString("base64url");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(PRIVATE_KEY, "base64url");
  return `${header}.${payload}.${signature}`;
}

/**
 * Requests an access token for a GitHub App installation.
 *
 * @param {number} installationId - GitHub installation ID.
 * @returns {Promise<string>} Installation access token.
 * @throws {Error} When the app is not configured or GitHub rejects the request.
 */
async function getInstallationToken(installationId) {
  const jwt = generateJWT();
  if (!jwt) throw new Error("GitHub App not configured");
  const { data } = await axios.post(
    `${GITHUB_API}/app/installations/${installationId}/access_tokens`,
    {},
    { headers: { Authorization: `Bearer ${jwt}`, Accept: "application/vnd.github+json" } }
  );
  return data.token;
}

/**
 * Fetches GitHub App installations, stores the first one in MongoDB, and returns it.
 *
 * @returns {Promise<Object|null>} Stored installation document, or `null` when unavailable.
 */
async function fetchInstallationsFromGitHub() {
  const jwt = generateJWT();
  if (!jwt) return null;
  try {
    const { data: installations } = await axios.get(`${GITHUB_API}/app/installations`, {
      headers: { Authorization: `Bearer ${jwt}`, Accept: "application/vnd.github+json" },
    });
    if (!installations || installations.length === 0) return null;
    const inst = installations[0];
    const doc = await GithubInstallation.findOneAndUpdate(
      { installationId: inst.id },
      {
        installationId: inst.id,
        accountLogin: inst.account?.login,
        accountType: inst.account?.type,
        organization: inst.account?.login,
        repositorySelection: inst.repository_selection,
        repositories: [],
        permissions: inst.permissions || {},
      },
      { upsert: true, new: true }
    );
    return doc;
  } catch (err) {
    console.error("[GITHUB] Failed to fetch installations from API:", err.message);
    return null;
  }
}

/**
 * Retrieves the newest stored GitHub installation, falling back to the GitHub API.
 *
 * @returns {Promise<Object|null>} Installation document or `null`.
 */
async function getInstallation() {
  let doc = await GithubInstallation.findOne().sort({ createdAt: -1 });
  if (!doc) {
    doc = await fetchInstallationsFromGitHub();
  }
  return doc;
}

/**
 * Upserts a GitHub installation from an installation webhook payload.
 *
 * @param {Object} payload - Webhook payload containing installation/account data.
 * @returns {Promise<Object>} Stored installation document.
 */
async function storeInstallation(payload) {
  const installationId = payload.installation?.id || payload.installation?.id;
  const account = payload.installation?.account || payload.sender || {};
  const repoSelection = payload.installation?.repository_selection || "selected";
  let repos = [];

  if (repoSelection === "selected" && payload.repositories) {
    repos = payload.repositories.map((r) => r.full_name);
  }

  const doc = await GithubInstallation.findOneAndUpdate(
    { installationId },
    {
      installationId,
      accountLogin: account.login,
      accountType: account.type,
      organization: payload.installation?.account?.login || account.login,
      repositorySelection: repoSelection,
      repositories: repos,
      permissions: payload.installation?.permissions || {},
    },
    { upsert: true, new: true }
  );
  return doc;
}

/**
 * Deletes a stored GitHub installation by installation ID.
 *
 * @param {number} installationId - GitHub installation ID.
 * @returns {Promise<void>} Resolves after deletion.
 */
async function removeInstallation(installationId) {
  await GithubInstallation.deleteOne({ installationId });
}

/**
 * Loads all repository mappings and indexes them by service name.
 *
 * @returns {Promise<Object>} Repository mappings keyed by service.
 */
async function listServicesWithRepo() {
  const mappings = await RepoMapping.find({}).lean();
  const map = {};
  for (const m of mappings) {
    map[m.service] = m;
  }
  return map;
}

/**
 * Retrieves a repository mapping for one service.
 *
 * @param {string} service - Service name.
 * @returns {Promise<Object|null>} Matching mapping document or `null`.
 */
async function getServiceMapping(service) {
  return RepoMapping.findOne({ service });
}

/**
 * Upserts a manual service-to-repository mapping unless an annotation mapping exists.
 *
 * @param {string} service - Service name.
 * @param {string} repoFullName - Repository name in owner/name form.
 * @param {string} [namespace] - Kubernetes namespace to store.
 * @returns {Promise<Object>} Stored mapping or an error object when protected by an annotation mapping.
 */
async function setManualMapping(service, repoFullName, namespace) {
  const parts = repoFullName.split("/");
  const existing = await RepoMapping.findOne({ service });
  if (existing && existing.mappingSource === "annotation") {
    return { error: "Cannot override annotation-based mapping" };
  }
  const doc = await RepoMapping.findOneAndUpdate(
    { service },
    {
      service,
      repo: { owner: parts[0], name: parts.slice(1).join("/"), fullName: repoFullName },
      mappingSource: "manual",
      namespace: namespace || "",
    },
    { upsert: true, new: true }
  );
  return doc;
}

/**
 * Checks whether a GitHub installation token can access a repository.
 *
 * @param {number} installationId - GitHub installation ID.
 * @param {string} repoFullName - Repository name in owner/name form.
 * @returns {Promise<Object>} `{ valid: true }`, or an object describing an inaccessible repository.
 */
async function validateRepoAccess(installationId, repoFullName) {
  const token = await getInstallationToken(installationId);
  const [owner, repo] = repoFullName.split("/");
  try {
    await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: { Authorization: `token ${token}`, Accept: "application/vnd.github+json" },
    });
    return { valid: true };
  } catch (err) {
    if (err.response?.status === 404) return { valid: false, error: "Repository not found or not accessible" };
    throw err;
  }
}

/**
 * Creates a GitHub issue in a repository using an installation token.
 *
 * @param {number} installationId - GitHub installation ID.
 * @param {string} repoFullName - Repository name in owner/name form.
 * @param {string} title - Issue title.
 * @param {string} body - Issue body.
 * @param {Array<string>} [labels=[]] - Issue labels.
 * @returns {Promise<Object>} GitHub issue response data.
 */
async function createIssue(installationId, repoFullName, title, body, labels = []) {
  const token = await getInstallationToken(installationId);
  const [owner, repo] = repoFullName.split("/");
  const { data } = await axios.post(
    `${GITHUB_API}/repos/${owner}/${repo}/issues`,
    { title, body, labels },
    { headers: { Authorization: `token ${token}`, Accept: "application/vnd.github+json" } }
  );
  return data;
}

/**
 * Stores a MongoDB link between an incident and a GitHub issue.
 *
 * @returns {Promise<Object>} Created issue-link document.
 */
async function linkIssueToIncident(incidentId, issueNumber, repoFullName, service) {
  return IncidentIssueLink.create({
    incidentId,
    githubIssue: issueNumber,
    repository: repoFullName,
    service,
    issueUrl: `https://github.com/${repoFullName}/issues/${issueNumber}`,
  });
}

/**
 * Retrieves GitHub issue links for an incident.
 *
 * @param {*} incidentId - Incident identifier.
 * @returns {Promise<Array<Object>>} Matching issue-link documents.
 */
async function getIncidentIssueLinks(incidentId) {
  return IncidentIssueLink.find({ incidentId }).lean();
}

/**
 * Returns the configured GitHub App installation URL.
 *
 * @returns {string|null} Installation URL or `null`.
 */
function getInstallUrl() {
  return INSTALL_URL || null;
}

/**
 * Handles supported GitHub installation webhook events.
 *
 * @param {string} event - GitHub event name.
 * @param {Object} payload - Event payload.
 * @returns {Promise<void>} Resolves after the supported installation operation.
 */
async function processWebhook(event, payload) {
  switch (event) {
    case "installation.created":
    case "installation_repositories.added":
      await storeInstallation(payload);
      break;
    case "installation.deleted":
      await removeInstallation(payload.installation?.id);
      break;
    default:
      break;
  }
}

module.exports = {
  generateJWT,
  getInstallationToken,
  getInstallation,
  fetchInstallationsFromGitHub,
  storeInstallation,
  removeInstallation,
  listServicesWithRepo,
  getServiceMapping,
  setManualMapping,
  validateRepoAccess,
  createIssue,
  linkIssueToIncident,
  getIncidentIssueLinks,
  getInstallUrl,
  processWebhook,
};

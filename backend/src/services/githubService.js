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

async function getInstallation() {
  let doc = await GithubInstallation.findOne().sort({ createdAt: -1 });
  if (!doc) {
    doc = await fetchInstallationsFromGitHub();
  }
  return doc;
}

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

async function removeInstallation(installationId) {
  await GithubInstallation.deleteOne({ installationId });
}

async function listServicesWithRepo() {
  const mappings = await RepoMapping.find({}).lean();
  const map = {};
  for (const m of mappings) {
    map[m.service] = m;
  }
  return map;
}

async function getServiceMapping(service) {
  return RepoMapping.findOne({ service });
}

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

async function linkIssueToIncident(incidentId, issueNumber, repoFullName, service) {
  return IncidentIssueLink.create({
    incidentId,
    githubIssue: issueNumber,
    repository: repoFullName,
    service,
    issueUrl: `https://github.com/${repoFullName}/issues/${issueNumber}`,
  });
}

async function getIncidentIssueLinks(incidentId) {
  return IncidentIssueLink.find({ incidentId }).lean();
}

function getInstallUrl() {
  return INSTALL_URL || null;
}

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

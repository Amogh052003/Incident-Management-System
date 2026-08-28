const express = require("express");
const crypto = require("crypto");
const {
  getInstallation,
  fetchInstallationsFromGitHub,
  getInstallUrl,
  createIssue,
  getIncidentIssueLinks,
  processWebhook,
} = require("../services/githubService");
const { getTopologyState, getTopologyGraph } = require("../core/topology/topologyServices");
const { getResources } = require("../core/resources/resourceRegistry");
const { pgPool } = require("../db/postgres");
const router = express.Router();

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

/**
 * @openapi
 * /github:
 *   get:
 *     summary: Complete GitHub connection redirect
 *     responses:
 *       302:
 *         description: Redirects to the frontend with a connected query value.
 */
router.get("/github", (req, res) => {
  res.redirect("/?github=connected");
});

/**
 * @openapi
 * /github/install:
 *   get:
 *     summary: Get GitHub installation information
 *     responses:
 *       200:
 *         description: Installation URL or existing installation information.
 *       503:
 *         description: GitHub App is not configured.
 *       500:
 *         description: Failed to retrieve GitHub installation information.
 */
router.get("/github/install", async (req, res) => {
  try {
    const existing = await fetchInstallationsFromGitHub();
    if (existing) {
      return res.json({ url: null, alreadyConnected: true, installation: existing });
    }
    const url = getInstallUrl();
    if (!url) return res.status(503).json({ error: "GitHub App not configured" });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /github/installation:
 *   get:
 *     summary: Get connected GitHub installation
 *     responses:
 *       200:
 *         description: GitHub connection status and installation information when connected.
 *       500:
 *         description: Failed to retrieve the GitHub installation.
 */
router.get("/github/installation", async (req, res) => {
  try {
    const inst = await getInstallation();
    if (!inst) return res.json({ connected: false });
    res.json({ connected: true, installationId: inst.installationId, accountLogin: inst.accountLogin, organization: inst.organization, repositorySelection: inst.repositorySelection, repositoriesCount: inst.repositories?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /github/services:
 *   get:
 *     summary: List services with repository mappings
 *     responses:
 *       200:
 *         description: Services, topology information, and repository mappings.
 *       500:
 *         description: Failed to retrieve GitHub service data.
 */
router.get("/github/services", async (req, res) => {
  try {
    const state = getTopologyState();
    const graph = getTopologyGraph();
    const resources = getResources();
    const { listServicesWithRepo } = require("../services/githubService");
    const mappings = await listServicesWithRepo();

    const services = Object.entries(state).map(([name, data]) => {
      const resource = resources[name] || {};
      const mapping = mappings[name] || null;
      return {
        name,
        status: data.status,
        incidents: data.incidents || [],
        incidentsCount: data.incidents?.length || 0,
        namespace: resource.namespace || resource.runtimeInstances?.[0] || "unknown",
        runtime: resource.type || "unknown",
        repo: mapping ? mapping.repo : null,
        mappingSource: mapping ? mapping.mappingSource : null,
        dependencies: graph[name] || [],
      };
    });

    res.json({ services, total: services.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /github/workspace/{service}:
 *   get:
 *     summary: Get GitHub workspace information for a service
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Service workspace, topology, incident, and repository data.
 *       404:
 *         description: Service not found.
 *       500:
 *         description: Failed to retrieve workspace information.
 */
router.get("/github/workspace/:service", async (req, res) => {
  try {
    const { service } = req.params;
    const state = getTopologyState();
    const graph = getTopologyGraph();
    const resources = getResources();
    const { getServiceMapping, listServicesWithRepo } = require("../services/githubService");
    const mappings = await listServicesWithRepo();

    const serviceState = state[service];
    if (!serviceState) return res.status(404).json({ error: "Service not found" });

    const resource = resources[service] || {};
    const mapping = mappings[service] || null;
    const dependencies = graph[service] || [];
    const dependents = [];
    for (const [src, targets] of Object.entries(graph)) {
      if (targets.includes(service)) dependents.push(src);
    }

    const impactResult = await pgPool.query(
      `SELECT work_item_id, status, rca, changed_at FROM work_item_logs
       WHERE work_item_id IN (SELECT id FROM work_items WHERE component_id = $1)
       ORDER BY changed_at DESC LIMIT 20`,
      [service]
    );
    const timeline = (impactResult.rows || []).map((r) => ({
      time: r.changed_at,
      event: r.status === "degraded" ? `${service} degraded` : `${service} status: ${r.status}`,
    }));

    const incidentsResult = await pgPool.query(
      `SELECT id, severity, status, created_at FROM work_items WHERE component_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [service]
    );
    const activeIncidents = (incidentsResult.rows || []).filter((r) => r.status !== "resolved" && r.status !== "closed");

    res.json({
      service,
      health: serviceState.status,
      namespace: resource.namespace || "unknown",
      runtime: resource.type || "unknown",
      severity: activeIncidents.length > 0 ? (activeIncidents[0].severity || "P3") : "OK",
      incidentsCount: serviceState.incidents?.length || 0,
      repo: mapping ? mapping.repo : null,
      mappingSource: mapping ? mapping.mappingSource : null,
      dependencies,
      dependents,
      timeline,
      activeIncidents: activeIncidents.map((r) => ({
        id: r.id, title: r.title, severity: r.severity, status: r.status, createdAt: r.created_at,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /github/validate-repo:
 *   post:
 *     summary: Validate repository access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [repo]
 *             properties:
 *               repo: { type: string }
 *     responses:
 *       200:
 *         description: Repository access validation result.
 *       400:
 *         description: Repository is missing or GitHub is not connected.
 *       500:
 *         description: Failed to validate repository access.
 */
router.post("/github/validate-repo", async (req, res) => {
  try {
    const { repo } = req.body;
    if (!repo) return res.status(400).json({ error: "repo required" });
    const inst = await getInstallation();
    if (!inst) return res.status(400).json({ error: "GitHub not connected" });
    const { validateRepoAccess } = require("../services/githubService");
    const result = await validateRepoAccess(inst.installationId, repo);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /github/issues:
 *   post:
 *     summary: Create a GitHub issue
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [service, title, body]
 *             properties:
 *               service: { type: string }
 *               title: { type: string }
 *               body: { type: string }
 *               labels: { type: array }
 *     responses:
 *       200:
 *         description: Created issue information.
 *       400:
 *         description: Required fields are missing, GitHub is not connected, or no repository is mapped.
 *       500:
 *         description: Failed to create the GitHub issue.
 */
router.post("/github/issues", async (req, res) => {
  try {
    const { service, title, body, labels = ["incident", "ims-generated"] } = req.body;
    if (!service || !title || !body) return res.status(400).json({ error: "service, title, and body required" });

    const inst = await getInstallation();
    if (!inst) return res.status(400).json({ error: "GitHub not connected" });

    const { getServiceMapping } = require("../services/githubService");
    const mapping = await getServiceMapping(service);
    if (!mapping || !mapping.repo) return res.status(400).json({ error: "No repo mapped for service" });

    const issue = await createIssue(inst.installationId, mapping.repo.fullName, title, body, labels);
    const { linkIssueToIncident } = require("../services/githubService");
    const { pgPool } = require("../db/postgres");
    const incidentsResult = await pgPool.query(
      `SELECT id FROM work_items WHERE component_id = $1 AND status != 'resolved' AND status != 'closed' ORDER BY created_at DESC LIMIT 1`,
      [service]
    );
    if (incidentsResult.rows.length > 0) {
      await linkIssueToIncident(incidentsResult.rows[0].id.toString(), issue.number, mapping.repo.fullName, service);
    }

    res.json({ success: true, issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /github/issues/{incidentId}:
 *   get:
 *     summary: Get issues linked to an incident
 *     parameters:
 *       - in: path
 *         name: incidentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Linked GitHub issue data.
 *       500:
 *         description: Failed to retrieve linked issues.
 */
router.get("/github/issues/:incidentId", async (req, res) => {
  try {
    const links = await getIncidentIssueLinks(req.params.incidentId);
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /github/webhook:
 *   post:
 *     summary: Receive a GitHub webhook
 *     description: Validates the optional webhook signature and processes the GitHub event payload.
 *     parameters:
 *       - in: header
 *         name: x-hub-signature-256
 *         required: false
 *         schema: { type: string }
 *       - in: header
 *         name: x-github-event
 *         required: false
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Webhook acknowledged, including when processing fails.
 *       401:
 *         description: Webhook signature is invalid.
 */
router.post("/github/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const event = req.headers["x-github-event"];
    const payload = req.body;

    if (WEBHOOK_SECRET) {
      const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
      hmac.update(JSON.stringify(payload));
      const digest = `sha256=${hmac.digest("hex")}`;
      if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    await processWebhook(event, payload);
    res.status(200).send("OK");
  } catch (err) {
    console.error("[GITHUB] Webhook error:", err.message);
    res.status(200).send("OK");
  }
});

module.exports = router;

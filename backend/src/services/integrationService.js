const { pgPool } = require("../db/postgres");
const redis = require("../db/redis");

const LIST_CACHE_KEY = "integrations:list";

async function getIntegrations() {
  const cached = await redis.get(LIST_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const res = await pgPool.query(
    "SELECT id, name, status, created_at, updated_at FROM integrations ORDER BY name"
  );
  await redis.set(LIST_CACHE_KEY, JSON.stringify(res.rows), "EX", 30);
  return res.rows;
}

async function getIntegrationByName(name) {
  const res = await pgPool.query("SELECT * FROM integrations WHERE name = $1", [name]);
  return res.rows[0] || null;
}

async function upsertIntegration(name, config, status) {
  const existing = await getIntegrationByName(name);
  if (existing) {
    const res = await pgPool.query(
      `UPDATE integrations SET config = $1, status = $2, updated_at = NOW() WHERE name = $3 RETURNING *`,
      [JSON.stringify(config), status || existing.status, name]
    );
    await redis.del(LIST_CACHE_KEY);
    return res.rows[0];
  }
  const res = await pgPool.query(
    `INSERT INTO integrations (name, config, status) VALUES ($1, $2, $3) RETURNING *`,
    [name, JSON.stringify(config), status || "pending"]
  );
  await redis.del(LIST_CACHE_KEY);
  return res.rows[0];
}

async function seedIntegrations() {
  const existing = await pgPool.query("SELECT COUNT(*) FROM integrations");
  if (parseInt(existing.rows[0].count) > 0) return;

  const defaults = [
    {
      name: "Slack",
      status: "configured",
      config: { webhookUrl: "", defaultChannel: "#incidents", escalationChannel: "#on-call" },
    },
    {
      name: "GitHub",
      status: "configured",
      config: { repository: "zeotap/ims", token: "", issueLabels: ["incident", "auto"] },
    },
    {
      name: "Jira",
      status: "pending",
      config: { projectKey: "", apiToken: "", workflowMapping: "" },
    },
    {
      name: "Prometheus",
      status: "pending",
      config: { scrapeEndpoint: "", metricPrefix: "ims_", alertmanagerUrl: "" },
    },
    {
      name: "PagerDuty",
      status: "configured",
      config: { serviceId: "", apiKey: "", escalationPolicy: "" },
    },
  ];

  for (const int of defaults) {
    await pgPool.query(
      `INSERT INTO integrations (name, status, config) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
      [int.name, int.status, JSON.stringify(int.config)]
    );
  }
}

module.exports = { getIntegrations, getIntegrationByName, upsertIntegration, seedIntegrations };

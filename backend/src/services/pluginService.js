const { pgPool } = require("../db/postgres");
const redis = require("../db/redis");

function cacheKey(id) { return `plugin:${id}`; }
const LIST_CACHE_KEY = "plugins:list";
const ACTIVITY_CACHE_KEY = "plugin:activity";

async function getPlugins() {
  const cached = await redis.get(LIST_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const res = await pgPool.query(
    "SELECT id, name, status, icon, subscribed_events, created_at, updated_at FROM plugins ORDER BY name"
  );
  const plugins = res.rows.map(r => ({
    ...r,
    subscribed_events: r.subscribed_events || [],
  }));
  await redis.set(LIST_CACHE_KEY, JSON.stringify(plugins), "EX", 30);
  return plugins;
}

async function getPluginById(id) {
  const cached = await redis.get(cacheKey(id));
  if (cached) return JSON.parse(cached);

  const res = await pgPool.query("SELECT * FROM plugins WHERE id = $1", [id]);
  if (res.rows.length === 0) return null;
  const plugin = res.rows[0];
  await redis.set(cacheKey(id), JSON.stringify(plugin), "EX", 30);
  return plugin;
}

async function updatePlugin(id, updates) {
  const sets = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (["name", "status", "icon", "config", "subscribed_events"].includes(key)) {
      sets.push(`${key} = $${idx}`);
      values.push(typeof value === "object" ? JSON.stringify(value) : value);
      idx++;
    }
  }

  if (sets.length === 0) return null;
  sets.push(`updated_at = NOW()`);
  values.push(id);

  const res = await pgPool.query(
    `UPDATE plugins SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  await redis.del(cacheKey(id), LIST_CACHE_KEY);
  return res.rows[0] || null;
}

async function seedPlugins() {
  const existing = await pgPool.query("SELECT COUNT(*) FROM plugins");
  if (parseInt(existing.rows[0].count) > 0) return;

  const defaults = [
    { name: "Slack", status: "active", icon: "MessageSquare", subscribed_events: ["incident.created", "incident.escalated", "incident.resolved"] },
    { name: "GitHub", status: "active", icon: "GitPullRequest", subscribed_events: ["incident.created", "incident.resolved"] },
    { name: "Jira", status: "inactive", icon: "BookOpen", subscribed_events: ["incident.created"] },
    { name: "PagerDuty", status: "active", icon: "Bell", subscribed_events: ["incident.escalated"] },
  ];

  for (const p of defaults) {
    await pgPool.query(
      `INSERT INTO plugins (name, status, icon, subscribed_events) VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO NOTHING`,
      [p.name, p.status, p.icon, JSON.stringify(p.subscribed_events)]
    );
  }
}

async function getActivityFeed(limit = 20) {
  const cached = await redis.get(ACTIVITY_CACHE_KEY);
  if (cached) return JSON.parse(cached).slice(0, limit);

  const res = await pgPool.query(
    "SELECT id, plugin_name, action, details, created_at FROM plugin_activity ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  await redis.set(ACTIVITY_CACHE_KEY, JSON.stringify(res.rows), "EX", 10);
  return res.rows;
}

async function logPluginActivity(pluginName, action, details) {
  await pgPool.query(
    "INSERT INTO plugin_activity (plugin_name, action, details) VALUES ($1, $2, $3)",
    [pluginName, action, details || null]
  );
  await redis.del(ACTIVITY_CACHE_KEY);
}

module.exports = { getPlugins, getPluginById, updatePlugin, seedPlugins, getActivityFeed, logPluginActivity };

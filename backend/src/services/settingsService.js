const { pgPool } = require("../db/postgres");
const redis = require("../db/redis");

const ALL_CACHE_KEY = "settings:all";

async function getSettings() {
  const cached = await redis.get(ALL_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const res = await pgPool.query("SELECT key, value, category FROM settings ORDER BY category, key");
  await redis.set(ALL_CACHE_KEY, JSON.stringify(res.rows), "EX", 30);
  return res.rows;
}

async function getSetting(key) {
  const res = await pgPool.query("SELECT key, value, category FROM settings WHERE key = $1", [key]);
  return res.rows[0] || null;
}

async function setSetting(key, value, category = "general") {
  await pgPool.query(
    `INSERT INTO settings (key, value, category) VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE SET value = $2, category = $3, updated_at = NOW()`,
    [key, value, category]
  );
  await redis.del(ALL_CACHE_KEY);
}

async function seedSettings() {
  const existing = await pgPool.query("SELECT COUNT(*) FROM settings");
  if (parseInt(existing.rows[0].count) > 0) return;

  const defaults = [
    { key: "theme", value: "dark", category: "platform" },
    { key: "timezone", value: "UTC", category: "platform" },
    { key: "refresh_interval", value: "10", category: "platform" },
    { key: "sso_enabled", value: "true", category: "security" },
    { key: "mfa_required", value: "true", category: "security" },
    { key: "session_timeout", value: "30", category: "security" },
    { key: "slack_channel", value: "#incidents", category: "notifications" },
    { key: "pagerduty_on_p0", value: "true", category: "notifications" },
    { key: "email_on_resolve", value: "true", category: "notifications" },
    { key: "docker_discovery", value: "enabled", category: "infrastructure" },
    { key: "k8s_discovery", value: "enabled", category: "infrastructure" },
    { key: "namespace_filter", value: "all", category: "infrastructure" },
  ];

  for (const s of defaults) {
    await pgPool.query(
      `INSERT INTO settings (key, value, category) VALUES ($1, $2, $3) ON CONFLICT (key) DO NOTHING`,
      [s.key, s.value, s.category]
    );
  }
}

module.exports = { getSettings, getSetting, setSetting, seedSettings };

const { pgPool } = require("../db/postgres");

async function logEvent(eventType, { component, severity, message, metadata } = {}) {
  await pgPool.query(
    `INSERT INTO audit_logs (event_type, component, severity, message, metadata) VALUES ($1, $2, $3, $4, $5)`,
    [eventType, component || null, severity || null, message || null, metadata ? JSON.stringify(metadata) : "{}"]
  );
}

async function getAuditLogs({ eventType, component, severity, limit = 100, offset = 0 } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (eventType) { conditions.push(`event_type = $${idx++}`); values.push(eventType); }
  if (component) { conditions.push(`component = $${idx++}`); values.push(component); }
  if (severity) { conditions.push(`severity = $${idx++}`); values.push(severity); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  values.push(limit);
  values.push(offset);

  const res = await pgPool.query(
    `SELECT id, event_type, component, severity, message, metadata, created_at FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
    values
  );
  return res.rows;
}

async function getAuditComponents() {
  const res = await pgPool.query("SELECT DISTINCT component FROM audit_logs WHERE component IS NOT NULL ORDER BY component");
  return res.rows.map(r => r.component);
}

async function getAuditSeverities() {
  const res = await pgPool.query("SELECT DISTINCT severity FROM audit_logs WHERE severity IS NOT NULL ORDER BY severity");
  return res.rows.map(r => r.severity);
}

module.exports = { logEvent, getAuditLogs, getAuditComponents, getAuditSeverities };

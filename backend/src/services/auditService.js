const { pgPool } = require("../db/postgres");

/**
 * Inserts an audit event into the PostgreSQL audit log.
 *
 * @param {string} eventType - Event type to store.
 * @param {Object} [details] - Optional event details.
 * @param {*} [details.component] - Component associated with the event.
 * @param {*} [details.severity] - Event severity.
 * @param {*} [details.message] - Event message.
 * @param {Object} [details.metadata] - Additional metadata serialized as JSON.
 * @returns {Promise<void>} Resolves after the insert completes.
 */
async function logEvent(eventType, { component, severity, message, metadata } = {}) {
  await pgPool.query(
    `INSERT INTO audit_logs (event_type, component, severity, message, metadata) VALUES ($1, $2, $3, $4, $5)`,
    [eventType, component || null, severity || null, message || null, metadata ? JSON.stringify(metadata) : "{}"]
  );
}

/**
 * Retrieves audit log rows using optional event, component, severity, and paging filters.
 *
 * @param {Object} [filters] - Query filters.
 * @param {*} [filters.eventType] - Event type filter.
 * @param {*} [filters.component] - Component filter.
 * @param {*} [filters.severity] - Severity filter.
 * @param {number} [filters.limit=100] - Maximum number of rows.
 * @param {number} [filters.offset=0] - Number of rows to skip.
 * @returns {Promise<Array<Object>>} Matching rows ordered newest first.
 */
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

/**
 * Retrieves distinct non-null audit components.
 *
 * @returns {Promise<string[]>} Sorted component names.
 */
async function getAuditComponents() {
  const res = await pgPool.query("SELECT DISTINCT component FROM audit_logs WHERE component IS NOT NULL ORDER BY component");
  return res.rows.map(r => r.component);
}

/**
 * Retrieves distinct non-null audit severities.
 *
 * @returns {Promise<string[]>} Sorted severity values.
 */
async function getAuditSeverities() {
  const res = await pgPool.query("SELECT DISTINCT severity FROM audit_logs WHERE severity IS NOT NULL ORDER BY severity");
  return res.rows.map(r => r.severity);
}

module.exports = { logEvent, getAuditLogs, getAuditComponents, getAuditSeverities };

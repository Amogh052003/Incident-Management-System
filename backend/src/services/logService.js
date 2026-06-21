const { pgPool } = require("../db/postgres");
const Signal = require("../models/signal");

const VALID_SOURCES = ["audit", "signal", "work_item"];

async function searchLogs({ q, from, to, sources, severity, component, page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;
  const sourceList = sources && sources !== "all"
    ? sources.split(",").filter(s => VALID_SOURCES.includes(s))
    : VALID_SOURCES;

  const promises = [];

  if (sourceList.includes("audit")) {
    promises.push(queryAuditLogs(q, from, to, severity, component, limit));
  }
  if (sourceList.includes("signal")) {
    promises.push(querySignalLogs(q, from, to, component, limit));
  }
  if (sourceList.includes("work_item")) {
    promises.push(queryWorkItemLogs(q, from, to, component, limit));
  }

  const results = await Promise.all(promises);
  const merged = results.flat();

  merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const total = merged.length;
  const paged = merged.slice(offset, offset + limit);

  return { entries: paged, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function queryAuditLogs(q, from, to, severity, component, limit) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (q) {
    conditions.push(`message ILIKE $${idx++}`);
    values.push(`%${q}%`);
  }
  if (from) {
    conditions.push(`created_at >= $${idx++}`);
    values.push(from);
  }
  if (to) {
    conditions.push(`created_at <= $${idx++}`);
    values.push(to);
  }
  if (severity) {
    const sevs = severity.split(",");
    const placeholders = sevs.map(() => `$${idx++}`);
    conditions.push(`severity IN (${placeholders.join(",")})`);
    values.push(...sevs);
  }
  if (component) {
    conditions.push(`component ILIKE $${idx++}`);
    values.push(`%${component}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const res = await pgPool.query(
    `SELECT id, event_type AS type, component, severity, message, metadata, created_at AS timestamp
     FROM audit_logs ${where}
     ORDER BY created_at DESC LIMIT $${idx}`,
    [...values, limit * 2]
  );

  return res.rows.map(r => ({
    id: `audit-${r.id}`,
    source: "audit",
    type: r.type,
    component: r.component,
    severity: r.severity,
    message: r.message,
    metadata: r.metadata,
    timestamp: r.timestamp,
  }));
}

async function querySignalLogs(q, from, to, component, limit) {
  const filter = {};

  if (q) {
    filter.$text = { $search: q };
  }
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }
  if (component) {
    filter.component_id = { $regex: component, $options: "i" };
  }

  const projection = q ? { score: { $meta: "textScore" } } : {};
  const sort = q ? { score: { $meta: "textScore" } } : { timestamp: -1 };

  const signals = await Signal.find(filter, projection)
    .sort(sort)
    .limit(limit * 2)
    .lean();

  return signals.map(s => ({
    id: `signal-${s._id}`,
    source: "signal",
    type: "signal",
    component: s.component_id,
      severity: s.severity,
    message: s.message,
    metadata: { work_item_id: s.work_item_id },
    timestamp: s.timestamp,
  }));
}

async function queryWorkItemLogs(q, from, to, component, limit) {
  const conditions = [];
  const values = [];
  let idx = 1;

  conditions.push(`wil.status IS NOT NULL`);
  if (q) {
    conditions.push(`(wil.rca::text ILIKE $${idx++} OR wi.component_id ILIKE $${idx++})`);
    values.push(`%${q}%`, `%${q}%`);
  }
  if (from) {
    conditions.push(`wil.changed_at >= $${idx++}`);
    values.push(from);
  }
  if (to) {
    conditions.push(`wil.changed_at <= $${idx++}`);
    values.push(to);
  }
  if (component) {
    conditions.push(`wi.component_id ILIKE $${idx++}`);
    values.push(`%${component}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const res = await pgPool.query(
    `SELECT wil.id, wil.status, wil.rca, wil.changed_at AS timestamp, wi.component_id, wi.severity
     FROM work_item_logs wil
     JOIN work_items wi ON wil.work_item_id = wi.id
     ${where}
     ORDER BY wil.changed_at DESC LIMIT $${idx}`,
    [...values, limit * 2]
  );

  return res.rows.map(r => {
    const rca = typeof r.rca === "string" ? JSON.parse(r.rca) : r.rca;
    const message = `Status changed to ${r.status}` + (rca?.root_cause ? ` — ${rca.root_cause}` : "");
    return {
      id: `workitem-${r.id}`,
      source: "work_item",
      type: "status_change",
      component: r.component_id,
      severity: r.severity,
      message,
      metadata: { status: r.status, rca },
      timestamp: r.timestamp,
    };
  });
}

async function getLogFilters() {
  const [components, severities, workComponents] = await Promise.all([
    pgPool.query("SELECT DISTINCT component FROM audit_logs WHERE component IS NOT NULL ORDER BY component"),
    pgPool.query("SELECT DISTINCT severity FROM audit_logs WHERE severity IS NOT NULL ORDER BY severity"),
    pgPool.query("SELECT DISTINCT component_id FROM work_items WHERE component_id IS NOT NULL ORDER BY component_id"),
  ]);

  const signalComponents = await Signal.distinct("component_id");

  const allComponents = [
    ...new Set([
      ...components.rows.map(r => r.component),
      ...workComponents.rows.map(r => r.component_id),
      ...signalComponents.filter(Boolean),
    ]),
  ].sort();

  return {
    sources: VALID_SOURCES,
    severities: severities.rows.map(r => r.severity).filter(Boolean),
    components: allComponents,
  };
}

module.exports = { searchLogs, getLogFilters };

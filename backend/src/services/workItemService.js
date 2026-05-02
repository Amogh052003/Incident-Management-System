const { pgPool } = require("../db/postgres");

function getSeverity(component_id) {
  // P0 for critical components
  if (component_id.includes('database') || component_id.includes('payment') || component_id.includes('auth')) {
    return 'P0';
  }
  // P1 for important but not critical
  if (component_id.includes('api-gateway') || component_id.includes('cache')) {
    return 'P1';
  }
  // P2 for everything else
  return 'P2';
}

async function createWorkItem(component_id) {
  const severity = getSeverity(component_id);

  const res = await pgPool.query(
    `INSERT INTO work_items (component_id, severity, created_at, updated_at, start_time)
     VALUES ($1, $2, NOW(), NOW(), NOW())
     RETURNING id`,
    [component_id, severity]
  );

  return res.rows[0].id;
}

module.exports = { createWorkItem, getSeverity };
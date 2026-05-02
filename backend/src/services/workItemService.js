const { pgPool } = require("../db/postgres");

async function createWorkItem(component_id) {
  const res = await pgPool.query(
    `INSERT INTO work_items (component_id, created_at, updated_at, start_time)
     VALUES ($1, NOW(), NOW(), NOW())
     RETURNING id`,
    [component_id]
  );

  return res.rows[0].id;
}

module.exports = { createWorkItem };
const { pgPool } = require("../db/postgres");
const { getState } = require("../states/stateFactory");
const redis = require("../db/redis");
const { invalidateDashboardListCaches } = require("./dashboardService");

async function updateStatus(id, newStatus, data = {}) {
  const client = await pgPool.connect();

  try {
    await client.query("BEGIN");

    const res = await client.query(
      "SELECT * FROM work_items WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (res.rows.length === 0) {
      throw new Error("Work item not found");
    }

    const workItem = res.rows[0];
    const state = getState(workItem);
    const updates = await state.transition(newStatus, data);

    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setQuery = fields
      .map((field, i) => `${field} = $${i + 2}`)
      .join(", ");

    await client.query(
      `UPDATE work_items SET ${setQuery}, updated_at = NOW() WHERE id = $1`,
      [id, ...values]
    );

    await client.query(
      `INSERT INTO work_item_logs (work_item_id, status, rca, changed_at)
       VALUES ($1, $2, $3, NOW())`,
      [id, updates.status || newStatus, data.rca || null]
    );

    await client.query("COMMIT");

    await invalidateDashboardListCaches();
    await redis.del(`dashboard:incident:${id}`);

    return "Status updated";
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { updateStatus };
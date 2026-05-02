const { pgPool } = require("../db/postgres");
const { getState } = require("../states/stateFactory");
const { createRedisClient } = require("../db/redis");

const redis = createRedisClient("workflow");

async function updateStatus(id, newStatus, data = {}) {
  // 1. Fetch work item
  const res = await pgPool.query(
    "SELECT * FROM work_items WHERE id = $1",
    [id]
  );

  if (res.rows.length === 0) {
    throw new Error("Work item not found");
  }

  const workItem = res.rows[0];

  // 2. Get current state object
  const state = getState(workItem);

  // 3. Let state decide transition
  const updates = await state.transition(newStatus, data);

  // 4. Build dynamic update query
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setQuery = fields
    .map((field, i) => `${field} = $${i + 2}`)
    .join(", ");

  await pgPool.query(
    `UPDATE work_items SET ${setQuery}, updated_at = NOW() WHERE id = $1`,
    [id, ...values]
  );

  await redis.del("dashboard:active");
  await redis.del(`dashboard:incident:${id}`);

  return "Status updated";
}

module.exports = { updateStatus };
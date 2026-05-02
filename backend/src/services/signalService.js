const Signal = require("../models/signal");
const { createWorkItem } = require("./workItemService");
const { pgPool } = require("../db/postgres");
const { increment } = require("../utils/metrics");
const retry = require("../utils/retry");
const { triggerAlert } = require("./alertService");
const { createRedisClient } = require("../db/redis");

const redis = createRedisClient("signal-service");

async function processSignal(signal) {
  const { component_id, message } = signal;

  const debounceKey = `debounce:${component_id}`;
  const workKey = `workitem:${component_id}`;

  try {
    const result = await redis.set(debounceKey, "1", "NX", "EX", 10);

    let workItemId;

    if (result === "OK") {
      const existing = await retry(() =>
        pgPool.query(
          `SELECT id FROM work_items 
           WHERE component_id = $1 AND status != 'CLOSED'
           ORDER BY created_at DESC LIMIT 1`,
          [component_id]
        )
      );

      if (existing.rows.length > 0) {
        workItemId = existing.rows[0].id;
        console.log(`🔁 Reusing Work Item ${workItemId}`);
      } else {
        workItemId = await retry(() => createWorkItem(component_id));
        console.log(`🔥 Created Work Item ${workItemId}`);
      }

      await redis.set(workKey, workItemId, "EX", 3600);

    } else {
      workItemId = await redis.get(workKey);

      if (!workItemId) {
        const existing = await retry(() =>
          pgPool.query(
            `SELECT id FROM work_items 
             WHERE component_id = $1 AND status != 'CLOSED'
             ORDER BY created_at DESC LIMIT 1`,
            [component_id]
          )
        );

        workItemId = existing.rows[0]?.id;
      }

      workItemId = Number(workItemId);

      if (!workItemId) {
        throw new Error("❌ No Work Item found for signal");
      }

      if (Math.random() < 0.1) {
        console.log(`🔁 Duplicate → Work Item ${workItemId}`);
      }
    }

    // ✅ Store first
    await retry(() =>
      Signal.create({
        component_id,
        message,
        work_item_id: workItemId,
        timestamp: new Date(),
      })
    );

    await redis.del("dashboard:active");

    if (workItemId) {
      await redis.del(`dashboard:incident:${workItemId}`);
    }

    triggerAlert(signal);

    increment();

    console.log(" Signal stored");

  } catch (err) {
    console.error("❌ Error processing signal:", err);
    throw err;
  }
}

module.exports = { processSignal };
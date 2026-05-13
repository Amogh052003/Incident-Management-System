const Signal = require("../models/signal");
const { createWorkItem } = require("./workItemService");
const { pgPool } = require("../db/postgres");
const { increment } = require("../utils/metrics");
const retry = require("../utils/retry");
const { triggerAlert } = require("./alertService");
const redis = require("../db/redis");
const { invalidateDashboardListCaches } = require("./dashboardService");

const eventBus = require("../core/events/eventBus");
const EVENTS = require("../core/events/eventTypes");

const {
  publish,
} = require("../core/distributed/publisher");

async function processSignal(signal) {
  const { component_id, message } = signal;

  const debounceKey = `debounce:${component_id}`;
  const workKey = `workitem:${component_id}`;

  try {
    const result = await redis.set(
      debounceKey,
      "1",
      "NX",
      "EX",
      10
    );

    let workItemId;
    let incidentCreated = false;

    // --------------------------------------------------
    // Incident / Work Item Resolution
    // --------------------------------------------------

    if (result === "OK") {
      const existing = await retry(() =>
        pgPool.query(
          `SELECT id FROM work_items 
           WHERE component_id = $1 
           AND status != 'CLOSED'
           ORDER BY created_at DESC
           LIMIT 1`,
          [component_id]
        )
      );

      if (existing.rows.length > 0) {
        workItemId = existing.rows[0].id;

        console.log(
          `Reusing Work Item ${workItemId}`
        );
      } else {
        workItemId = await retry(() =>
          createWorkItem(component_id)
        );

        incidentCreated = true;

        console.log(
          `Created Work Item ${workItemId}`
        );
      }

      await redis.set(
        workKey,
        workItemId,
        "EX",
        3600
      );
    } else {
      workItemId = await redis.get(workKey);

      if (!workItemId) {
        const existing = await retry(() =>
          pgPool.query(
            `SELECT id FROM work_items 
             WHERE component_id = $1 
             AND status != 'CLOSED'
             ORDER BY created_at DESC
             LIMIT 1`,
            [component_id]
          )
        );

        workItemId = existing.rows[0]?.id;
      }

      workItemId = Number(workItemId);

      if (!workItemId) {
        throw new Error(
          "❌ No Work Item found for signal"
        );
      }

      if (Math.random() < 0.1) {
        console.log(
          `Duplicate → Work Item ${workItemId}`
        );
      }
    }

    // --------------------------------------------------
    // Store Signal
    // --------------------------------------------------

    await retry(() =>
      Signal.create({
        component_id,
        message,
        work_item_id: workItemId,
        timestamp: new Date(),
      })
    );

    await redis.incr(
      `signal_count:${workItemId}`
    );

    // --------------------------------------------------
    // Alerting + Metrics
    // --------------------------------------------------

    const severity = triggerAlert(signal);

    const now = new Date();

    const bucket =
      `${now.getFullYear()}-` +
      `${String(now.getMonth() + 1).padStart(2, "0")}-` +
      `${String(now.getDate()).padStart(2, "0")}:` +
      `${String(now.getHours()).padStart(2, "0")}:00`;

    await redis.incr(`signals:${bucket}`);

    await redis.incr(
      `severity:${severity}:${bucket}`
    );

    // --------------------------------------------------
    // Cache Invalidation
    // --------------------------------------------------

    await invalidateDashboardListCaches();

    if (workItemId) {
      await redis.del(
        `dashboard:incident:${workItemId}`
      );
    }

    // --------------------------------------------------
    // Severity Updates
    // --------------------------------------------------

    if (result === "OK") {
      await retry(() =>
        pgPool.query(
          `UPDATE work_items 
           SET severity = $1 
           WHERE id = $2`,
          [severity, workItemId]
        )
      );
    }

    increment();

    console.log(" Signal stored");

    // --------------------------------------------------
    // Domain Events
    // --------------------------------------------------

    if (incidentCreated) {
      const payload = {
        incidentId: workItemId,
        componentId: component_id,
        severity,
        timestamp: Date.now(),
      };

      // Local in-process events
      eventBus.emit(
        EVENTS.INCIDENT_CREATED,
        payload
      );

      // Distributed cross-runtime events
      await publish(
        "incident.created",
        payload
      );
    }

  } catch (err) {
    console.error(
      " Error processing signal:",
      err
    );

    throw err;
  }
}

module.exports = {
  processSignal,
};
const { pgPool } = require("../db/postgres");
const mongoose = require("mongoose");
const Signal = require("../models/signal");
const { createRedisClient } = require("../db/redis");

const redis = createRedisClient("dashboard");

// 🔥 GET ALL INCIDENTS WITH STATUS FILTER
async function getActiveIncidents(statusFilter = "ACTIVE") {
  // statusFilter: "ALL", "ACTIVE" (default), or specific status like "OPEN", "RESOLVED", "CLOSED"
  let cacheKey;
  if (statusFilter === "ACTIVE") {
    cacheKey = "dashboard:active";
  } else if (statusFilter === "ALL") {
    cacheKey = "dashboard:all";
  } else {
    cacheKey = `dashboard:status:${statusFilter}`;
  }

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("⚡ Cache hit");
    return JSON.parse(cached);
  }

  console.log("🐢 DB hit");

  // 2. Fetch from DB
  let query = `
    SELECT id, component_id, status, start_time
    FROM work_items
  `;

  if (statusFilter === "ACTIVE") {
    query += `WHERE status != 'CLOSED'`;
  } else if (statusFilter !== "ALL") {
    query += `WHERE status = '${statusFilter}'`;
  }

  query += ` ORDER BY created_at DESC`;

  const res = await pgPool.query(query);

  const workItemIds = res.rows.map((row) => row.id);
  let signalCounts = {};
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (workItemIds.length > 0 && isMongoConnected) {
    try {
      const aggregates = await Signal.aggregate([
        { $match: { work_item_id: { $in: workItemIds } } },
        { $group: { _id: "$work_item_id", count: { $sum: 1 } } },
      ]);

      signalCounts = aggregates.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
    } catch (err) {
      // Keep dashboard available even if Mongo metrics are temporarily unavailable.
      console.warn("Signal count unavailable for active incidents:", err.message);
    }
  } else if (!isMongoConnected) {
    console.warn("Signal count skipped: MongoDB not connected.");
  }

  const incidents = res.rows.map((row) => ({
    ...row,
    signal_count: signalCounts[row.id] || 0,
  }));

  // 3. Cache result (5 sec TTL)
  const ttl = statusFilter === "CLOSED" ? 60 : 5; // longer cache for closed incidents
  await redis.set(cacheKey, JSON.stringify(incidents), "EX", ttl);

  return incidents;
}

// 🔥 GET INCIDENT DETAILS
async function getIncidentById(id) {
  const cacheKey = `dashboard:incident:${id}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("⚡ Cache hit (detail)");
    return JSON.parse(cached);
  }

  const res = await pgPool.query(
    `SELECT * FROM work_items WHERE id = $1`,
    [id]
  );

  if (res.rows.length === 0) {
    throw new Error("Incident not found");
  }

  let signalCount = 0;
  const isMongoConnected = mongoose.connection.readyState === 1;
  if (isMongoConnected) {
    try {
      signalCount = await Signal.countDocuments({ work_item_id: Number(id) });
    } catch (err) {
      // Keep incident details available even if Mongo metrics are temporarily unavailable.
      console.warn("Signal count unavailable for incident detail:", err.message);
    }
  } else {
    console.warn("Signal count skipped for incident detail: MongoDB not connected.");
  }

  const incident = {
    ...res.rows[0],
    signal_count: signalCount,
  };

  await redis.set(cacheKey, JSON.stringify(incident), "EX", 10);

  return incident;
}

module.exports = {
  getActiveIncidents,
  getIncidentById,
};
const express = require("express");
const RawSignal = require("../models/rawSignal");
const { createRedisClient } = require("../db/redis");

const router = express.Router();
const redis = createRedisClient("signal-routes");

router.post("/", async (req, res) => {
  try {
    await RawSignal.create({
      payload: req.body,
      timestamp: new Date(),
    });

    await redis.lpush("signal_queue", JSON.stringify(req.body));
    res.status(202).send("accepted");
  } catch (err) {
    console.error("Failed to store raw signal:", err);
    res.status(500).send("Failed to store raw signal");
  }
});

module.exports = router;
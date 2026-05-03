const express = require("express");
const redis = require("../db/redis");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const pipeline = redis.pipeline();
    pipeline.lpush("signal_queue", JSON.stringify(req.body));
    await pipeline.exec();

    return res.status(202).json({ status: "accepted" });
  } catch (err) {
    console.error("Failed to queue signal:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
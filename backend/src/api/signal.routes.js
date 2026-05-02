const express = require("express");
const { createRedisClient } = require("../db/redis");

const router = express.Router();
const redis = createRedisClient("signal-routes");

router.post("/", async (req, res) => {
  await redis.lpush("signal_queue", JSON.stringify(req.body));
  res.status(202).send("accepted");
});

module.exports = router;
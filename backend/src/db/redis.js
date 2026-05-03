const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
});

redis.on("error", (err) => {
  console.warn(`[redis] unavailable: ${err.message}`);
});

redis.on("ready", () => {
  console.log("[redis] connected");
});

module.exports = redis;

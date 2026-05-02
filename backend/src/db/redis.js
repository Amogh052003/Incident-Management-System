const Redis = require("ioredis");

const loggedContexts = new Set();

function createRedisClient(context = "default") {
  const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
  });

  redis.on("error", (err) => {
    // Keep logging concise to avoid noisy retry spam when Redis is down.
    if (loggedContexts.has(context)) return;
    loggedContexts.add(context);
    console.warn(`[redis:${context}] unavailable: ${err.message}`);
  });

  redis.on("ready", () => {
    loggedContexts.delete(context);
  });

  return redis;
}

module.exports = { createRedisClient };

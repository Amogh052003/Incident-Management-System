const redis = require("../db/redis");

const WINDOW_SIZE = 10; // seconds
const MAX_REQUESTS = 100;

async function rateLimiter(req, res, next) {
  try {
    const ip = req.ip || req.connection.remoteAddress;

    const key = `rate:${ip}`;

    // increment counter
    const current = await redis.incr(key);

    if (current === 1) {
      // first request → set expiry
      await redis.expire(key, WINDOW_SIZE);
    }

    if (current > MAX_REQUESTS) {
      return res.status(429).json({
        error: "Too many requests",
        retry_after: WINDOW_SIZE,
      });
    }

    next();

  } catch (err) {
    console.error("Rate limiter error:", err);

    // fail open (don't block API if Redis fails)
    next();
  }
}

module.exports = rateLimiter;
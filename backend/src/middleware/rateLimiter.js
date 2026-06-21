const redis = require("../db/redis");

const WINDOW_SIZE = 10; // seconds
const MAX_REQUESTS = 100;

async function rateLimiter(req, res, next) {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate:${ip}`;

    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, WINDOW_SIZE);
    const results = await multi.exec();
    const current = results[0][1];

    if (current > MAX_REQUESTS) {
      return res.status(429).json({
        error: "Too many requests",
        retry_after: WINDOW_SIZE,
      });
    }

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    next();
  }
}

module.exports = rateLimiter;
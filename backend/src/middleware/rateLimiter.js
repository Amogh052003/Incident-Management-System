const redis = require("../db/redis");

const WINDOW_SIZE = 10; // seconds

const MAX_REQUESTS = 100;

/**
 * Limits requests by client IP using a Redis counter
 * and a fixed expiration window.
 *
 * Requests over the configured limit receive HTTP 429.
 * If Redis fails, the error is logged and the request
 * continues through the middleware chain.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express middleware continuation callback.
 * @returns {Promise<void>} Resolves after sending a response or calling next().
 */
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
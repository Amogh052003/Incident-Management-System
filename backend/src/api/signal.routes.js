const express = require("express");
const redis = require("../db/redis");

const router = express.Router();

/**
 * @openapi
 * /signal/:
 *   post:
 *     summary: Queue a signal
 *     description: Validates and queues a signal payload for processing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - component_id
 *               - message
 *             properties:
 *               component_id:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       202:
 *         description: Signal accepted for processing.
 *       400:
 *         description: Required fields are missing, have invalid types, or exceed length limits.
 *       500:
 *         description: Signal could not be queued.
 */
router.post("/", async (req, res) => {
  try {
    const { component_id, message } = req.body;
    if (!component_id || !message) {
      return res.status(400).json({ error: "component_id and message are required" });
    }
    if (typeof component_id !== "string" || typeof message !== "string") {
      return res.status(400).json({ error: "component_id and message must be strings" });
    }
    if (component_id.length > 200 || message.length > 5000) {
      return res.status(400).json({ error: "component_id or message exceeds maximum length" });
    }

    const pipeline = redis.pipeline();
    pipeline.lpush("signal_queue", JSON.stringify({ component_id, message, ...req.body }));
    await pipeline.exec();

    return res.status(202).json({ status: "accepted" });
  } catch (err) {
    console.error("Failed to queue signal:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
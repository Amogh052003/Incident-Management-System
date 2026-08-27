const express = require("express");
const { logEvent, getAuditLogs, getAuditComponents, getAuditSeverities } = require("../services/auditService");

const router = express.Router();
/**
 * @openapi
 * /audit/log:
 *   post:
 *     summary: Create an audit log entry
 *     description: Records an event in the audit log.
 *     tags:
 *       - Audit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuditLogRequest'
 *     responses:
 *       '201':
 *         description: Audit event successfully logged.
 *       '400':
 *         description: event_type was not provided.
 *       '500':
 *         description: Failed to create the audit event.
 */
router.post("/audit/log", async (req, res) => {
  try {
    const { event_type, component, severity, message, metadata } = req.body;
    if (!event_type) return res.status(400).json({ error: "event_type is required" });
    await logEvent(event_type, { component, severity, message, metadata });
    res.status(201).json({ status: "logged" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * @openapi
 * /audit/logs:
 *   get:
 *     summary: Retrieve audit logs
 *     description: Retrieves audit events with optional filtering and pagination.
 *     tags:
 *       - Audit
 *     parameters:
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *         description: Filter logs by event type.
 *       - in: query
 *         name: component
 *         schema:
 *           type: string
 *         description: Filter logs by component.
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filter logs by severity.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of records to return.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip.
 *     responses:
 *       '200':
 *         description: List of audit log records.
 *       '500':
 *         description: Failed to retrieve audit logs.
 */
router.get("/audit/logs", async (req, res) => {
  try {
    const { event_type, component, severity, limit, offset } = req.query;
    const logs = await getAuditLogs({
      eventType: event_type,
      component,
      severity,
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * @openapi
 * /audit/filters:
 *   get:
 *     summary: Retrieve available audit filters
 *     description: Returns the distinct components and severities present in the audit log.
 *     tags:
 *       - Audit
 *     responses:
 *       '200':
 *         description: Available audit components and severities.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 components:
 *                   type: array
 *                   items:
 *                     type: string
 *                 severities:
 *                   type: array
 *                   items:
 *                     type: string
 *       '500':
 *         description: Failed to retrieve audit filters.
 */
router.get("/audit/filters", async (req, res) => {
  try {
    const [components, severities] = await Promise.all([
      getAuditComponents(),
      getAuditSeverities(),
    ]);
    res.json({ components, severities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

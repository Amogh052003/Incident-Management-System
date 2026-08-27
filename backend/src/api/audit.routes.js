const express = require("express");
const { logEvent, getAuditLogs, getAuditComponents, getAuditSeverities } = require("../services/auditService");

const router = express.Router();
/**
 * Create an audit log entry.
 *
 * @route POST /audit/log
 * @description Records an event in the audit log.
 *
 * @body event_type string required - Type of event being recorded.
 * @body component string - Component associated with the event.
 * @body severity string - Severity of the event.
 * @body message string - Human-readable description.
 * @body metadata object - Additional structured metadata.
 *
 * @response 201 - Audit event successfully logged.
 * @response 400 - event_type was not provided.
 * @response 500 - Failed to create the audit event.
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
 * Retrieve audit logs.
 *
 * @route GET /audit/logs
 * @description Retrieves audit events with optional filtering and pagination.
 *
 * @query event_type string - Filter by event type.
 * @query component string - Filter by component.
 * @query severity string - Filter by severity.
 * @query limit integer - Maximum number of records to return. Defaults to 100.
 * @query offset integer - Number of records to skip. Defaults to 0.
 *
 * @response 200 - List of audit log records.
 * @response 500 - Failed to retrieve audit logs.
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
 * Retrieve available audit filters.
 *
 * @route GET /audit/filters
 * @description Returns the distinct components and severities present in the audit log.
 *
 * @response 200 - Available components and severities.
 * @response 500 - Failed to retrieve audit filters.
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

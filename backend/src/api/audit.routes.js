const express = require("express");
const { logEvent, getAuditLogs, getAuditComponents, getAuditSeverities } = require("../services/auditService");

const router = express.Router();

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

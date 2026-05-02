const express = require("express");
const {
  getActiveIncidents,
  getIncidentById,
  getIncidentLogs,
} = require("../services/dashboardService");

const router = express.Router();

// 🔥 GET ALL INCIDENTS
router.get("/incidents", async (req, res) => {
  try {
    const status = req.query.status || "ACTIVE"; // default to ACTIVE
    const data = await getActiveIncidents(status);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 🔥 GET INCIDENT DETAIL
router.get("/incidents/:id", async (req, res) => {
  try {
    const data = await getIncidentById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

// 🔥 GET INCIDENT LOGS
router.get("/incidents/:id/logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const data = await getIncidentLogs(req.params.id, limit);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
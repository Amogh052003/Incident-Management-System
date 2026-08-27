const express = require("express");
const {
  getActiveIncidents,
  getIncidentById,
  getIncidentLogs,
} = require("../services/dashboardService");

const router = express.Router();


/**
 * GET /incidents: returns incidents selected by the optional status query.
 *
 * @param {import('express').Request} req - Request with optional `status` query.
 * @param {import('express').Response} res - Response containing incident data or an error.
 */
router.get("/incidents", async (req, res) => {
  try {
    const status = req.query.status || "ACTIVE"; // default to ACTIVE
    const data = await getActiveIncidents(status);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


/**
 * GET /incidents/:id: returns one incident or a 404 response.
 *
 * @param {import('express').Request} req - Request containing the incident ID parameter.
 * @param {import('express').Response} res - Express response.
 */
router.get("/incidents/:id", async (req, res) => {
  try {
    const data = await getIncidentById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

// 🔥 GET INCIDENT LOGS
/**
 * GET /incidents/:id/logs: returns recent signal logs for an incident.
 *
 * @param {import('express').Request} req - Request containing ID and optional numeric `limit` query.
 * @param {import('express').Response} res - Express response.
 */
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
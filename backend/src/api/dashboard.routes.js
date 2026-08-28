const express = require("express");
const {
  getActiveIncidents,
  getIncidentById,
  getIncidentLogs,
} = require("../services/dashboardService");

const router = express.Router();


/**
 * @openapi
 * /incidents:
 *   get:
 *     summary: List incidents
 *     description: Returns incidents filtered by the optional status query parameter.
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Status filter; defaults to ACTIVE.
 *     responses:
 *       200:
 *         description: Incident data.
 *       500:
 *         description: Failed to retrieve incidents.
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
 * @openapi
 * /incidents/{id}:
 *   get:
 *     summary: Get an incident
 *     description: Returns the incident identified by the path parameter.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Incident data.
 *       404:
 *         description: Incident lookup failed or the incident was not found.
 */
router.get("/incidents/:id", async (req, res) => {
  try {
    const data = await getIncidentById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

/**
 * @openapi
 * /incidents/{id}/logs:
 *   get:
 *     summary: Get incident signal logs
 *     description: Returns recent signal logs for the incident.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of logs to return.
 *     responses:
 *       200:
 *         description: Signal log data.
 *       500:
 *         description: Failed to retrieve logs.
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
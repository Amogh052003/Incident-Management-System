const express = require("express");
const { searchLogs, getLogFilters } = require("../services/logService");

const router = express.Router();

/**
 * @openapi
 * /logs/search:
 *   get:
 *     summary: Search logs
 *     description: Searches logs using optional text, time, source, severity, component, and paging filters.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *       - in: query
 *         name: sources
 *         schema: { type: string }
 *       - in: query
 *         name: severity
 *         schema: { type: string }
 *       - in: query
 *         name: component
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paged log search results.
 *       500:
 *         description: Failed to search logs.
 */
router.get("/logs/search", async (req, res) => {
  try {
    const { q, from, to, sources, severity, component, page, limit } = req.query;

    const result = await searchLogs({
      q,
      from,
      to,
      sources,
      severity,
      component,
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(200, Math.max(1, parseInt(limit) || 50)),
    });

    res.json(result);
  } catch (err) {
    console.error("Log search error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /logs/filters:
 *   get:
 *     summary: Get log filters
 *     responses:
 *       200:
 *         description: Available log filter values.
 *       500:
 *         description: Failed to retrieve log filters.
 */
router.get("/logs/filters", async (req, res) => {
  try {
    const filters = await getLogFilters();
    res.json(filters);
  } catch (err) {
    console.error("Log filters error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

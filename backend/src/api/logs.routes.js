const express = require("express");
const { searchLogs, getLogFilters } = require("../services/logService");

const router = express.Router();

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

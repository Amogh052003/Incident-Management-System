const express = require("express");
const { getServiceMapping, setManualMapping, listServicesWithRepo } = require("../services/githubService");
const router = express.Router();

router.get("/repo-mappings", async (req, res) => {
  try {
    const mappings = await listServicesWithRepo();
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/repo-mappings/:service", async (req, res) => {
  try {
    const mapping = await getServiceMapping(req.params.service);
    if (!mapping) return res.status(404).json({ error: "Mapping not found" });
    res.json(mapping);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/repo-mappings/:service", async (req, res) => {
  try {
    const { repo, namespace } = req.body;
    if (!repo) return res.status(400).json({ error: "repo required" });
    const result = await setManualMapping(req.params.service, repo, namespace);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

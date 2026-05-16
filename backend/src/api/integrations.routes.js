const express = require("express");
const { getIntegrations, getIntegrationByName, upsertIntegration } = require("../services/integrationService");

const router = express.Router();

router.get("/integrations", async (req, res) => {
  try {
    const integrations = await getIntegrations();
    res.json(integrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/integrations/:name", async (req, res) => {
  try {
    const integration = await getIntegrationByName(req.params.name);
    if (!integration) return res.status(404).json({ error: "Integration not found" });
    const { config, ...safe } = integration;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/integrations/:name", async (req, res) => {
  try {
    const { config, status } = req.body;
    const result = await upsertIntegration(req.params.name, config || {}, status);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

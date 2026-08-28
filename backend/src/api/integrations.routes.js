const express = require("express");
const { getIntegrations, getIntegrationByName, upsertIntegration } = require("../services/integrationService");

const router = express.Router();

/**
 * @openapi
 * /integrations:
 *   get:
 *     summary: List integrations
 *     responses:
 *       200:
 *         description: Integration data.
 *       500:
 *         description: Failed to retrieve integrations.
 */
router.get("/integrations", async (req, res) => {
  try {
    const integrations = await getIntegrations();
    res.json(integrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /integrations/{name}:
 *   get:
 *     summary: Get an integration
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Integration data without its config field.
 *       404:
 *         description: Integration not found.
 *       500:
 *         description: Failed to retrieve the integration.
 */
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

/**
 * @openapi
 * /integrations/{name}:
 *   put:
 *     summary: Create or update an integration
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               config:
 *                 type: object
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Integration data.
 *       500:
 *         description: Failed to update the integration.
 */
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

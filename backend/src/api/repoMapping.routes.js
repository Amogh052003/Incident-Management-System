const express = require("express");
const { getServiceMapping, setManualMapping, listServicesWithRepo } = require("../services/githubService");
const router = express.Router();

/**
 * @openapi
 * /repo-mappings:
 *   get:
 *     summary: List repository mappings
 *     responses:
 *       200:
 *         description: Repository mapping data.
 *       500:
 *         description: Failed to retrieve repository mappings.
 */
router.get("/repo-mappings", async (req, res) => {
  try {
    const mappings = await listServicesWithRepo();
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /repo-mappings/{service}:
 *   get:
 *     summary: Get a service repository mapping
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Repository mapping.
 *       404:
 *         description: Mapping not found.
 *       500:
 *         description: Failed to retrieve the mapping.
 */
router.get("/repo-mappings/:service", async (req, res) => {
  try {
    const mapping = await getServiceMapping(req.params.service);
    if (!mapping) return res.status(404).json({ error: "Mapping not found" });
    res.json(mapping);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /repo-mappings/{service}:
 *   post:
 *     summary: Set a service repository mapping
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [repo]
 *             properties:
 *               repo: { type: string }
 *               namespace: { type: string }
 *     responses:
 *       200:
 *         description: Repository mapping result.
 *       400:
 *         description: Repository is missing or the mapping is protected.
 *       500:
 *         description: Failed to set the mapping.
 */
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

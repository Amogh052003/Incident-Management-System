const express = require("express");
const { getSettings, getSetting, setSetting } = require("../services/settingsService");

const router = express.Router();

/**
 * @openapi
 * /settings:
 *   get:
 *     summary: List settings
 *     responses:
 *       200:
 *         description: Settings data.
 *       500:
 *         description: Failed to retrieve settings.
 */
router.get("/settings", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /settings/{key}:
 *   get:
 *     summary: Get a setting
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Setting data.
 *       404:
 *         description: Setting not found.
 *       500:
 *         description: Failed to retrieve the setting.
 */
router.get("/settings/:key", async (req, res) => {
  try {
    const setting = await getSetting(req.params.key);
    if (!setting) return res.status(404).json({ error: "Setting not found" });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /settings/{key}:
 *   put:
 *     summary: Set a setting
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value: {}
 *               category: { type: string }
 *     responses:
 *       200:
 *         description: Updated setting data.
 *       500:
 *         description: Failed to update the setting.
 */
router.put("/settings/:key", async (req, res) => {
  try {
    const { value, category } = req.body;
    await setSetting(req.params.key, value, category);
    res.json({ key: req.params.key, value, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

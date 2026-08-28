const express = require("express");
const { getPlugins, getPluginById, updatePlugin, getActivityFeed, logPluginActivity } = require("../services/pluginService");

const router = express.Router();

/**
 * @openapi
 * /plugins:
 *   get:
 *     summary: List plugins
 *     responses:
 *       200:
 *         description: Plugin data.
 *       500:
 *         description: Failed to retrieve plugins.
 */
router.get("/plugins", async (req, res) => {
  try {
    const plugins = await getPlugins();
    res.json(plugins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /plugins/{id}:
 *   get:
 *     summary: Get a plugin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Plugin data.
 *       404:
 *         description: Plugin not found.
 *       500:
 *         description: Failed to retrieve the plugin.
 */
router.get("/plugins/:id", async (req, res) => {
  try {
    const plugin = await getPluginById(req.params.id);
    if (!plugin) return res.status(404).json({ error: "Plugin not found" });
    res.json(plugin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /plugins/{id}:
 *   put:
 *     summary: Update a plugin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Updated plugin data.
 *       404:
 *         description: Plugin not found.
 *       500:
 *         description: Failed to update the plugin.
 */
router.put("/plugins/:id", async (req, res) => {
  try {
    const plugin = await updatePlugin(req.params.id, req.body);
    if (!plugin) return res.status(404).json({ error: "Plugin not found" });
    await logPluginActivity(plugin.name, "config_updated", "Plugin configuration updated");
    res.json(plugin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /plugins/activity/feed:
 *   get:
 *     summary: Get plugin activity
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Plugin activity entries.
 *       500:
 *         description: Failed to retrieve plugin activity.
 */
router.get("/plugins/activity/feed", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const feed = await getActivityFeed(limit);
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

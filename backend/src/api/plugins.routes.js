const express = require("express");
const { getPlugins, getPluginById, updatePlugin, getActivityFeed, logPluginActivity } = require("../services/pluginService");

const router = express.Router();

router.get("/plugins", async (req, res) => {
  try {
    const plugins = await getPlugins();
    res.json(plugins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/plugins/:id", async (req, res) => {
  try {
    const plugin = await getPluginById(req.params.id);
    if (!plugin) return res.status(404).json({ error: "Plugin not found" });
    res.json(plugin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

const express = require("express");
const { getSettings, getSetting, setSetting } = require("../services/settingsService");

const router = express.Router();

router.get("/settings", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/settings/:key", async (req, res) => {
  try {
    const setting = await getSetting(req.params.key);
    if (!setting) return res.status(404).json({ error: "Setting not found" });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

const pluginManager = require("./pluginManager");

async function loadPlugins(ctx) {
  await pluginManager.initAll(ctx);
}

module.exports = { loadPlugins };
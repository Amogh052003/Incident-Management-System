class PluginManager {
  constructor() {
    this.plugins = [];
  }

  register(plugin) {
    this.plugins.push(plugin);
    console.log(`[PLUGIN] Registered: ${plugin.name}`);
  }

  async initAll(ctx) {
    for (const plugin of this.plugins) {
      await plugin.init(ctx);
      console.log(`[PLUGIN] Initialized: ${plugin.name}`);
    }
  }

  getPlugins() {
    return this.plugins;
  }
}

module.exports = new PluginManager();
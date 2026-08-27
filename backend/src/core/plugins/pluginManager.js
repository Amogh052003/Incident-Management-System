class PluginManager {
  /** Creates an empty plugin manager. */
  constructor() {
    this.plugins = [];
  }

  /**
   * Registers a plugin and logs its name.
   *
   * @param {Object} plugin - Plugin containing a `name` property.
   * @returns {void}
   */
  register(plugin) {
    this.plugins.push(plugin);
    console.log(`[PLUGIN] Registered: ${plugin.name}`);
  }

  /**
   * Initializes every registered plugin with the supplied context.
   *
   * @param {*} ctx - Context passed to each plugin's `init` method.
   * @returns {Promise<void>} Resolves after all plugins initialize.
   */
  async initAll(ctx) {
    for (const plugin of this.plugins) {
      await plugin.init(ctx);
      console.log(`[PLUGIN] Initialized: ${plugin.name}`);
    }
  }

  /**
   * Returns the registered plugin instances.
   *
   * @returns {Array<Object>} Registered plugins.
   */
  getPlugins() {
    return this.plugins;
  }
}

module.exports = new PluginManager();
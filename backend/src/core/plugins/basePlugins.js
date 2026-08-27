class BasePlugin {
  /**
   * Creates a base plugin with its configuration and default name.
   *
   * @param {Object} [config={}] - Plugin configuration.
   */
  constructor(config = {}) {
    this.config = config;
    this.name = "base-plugin";
  }

  /**
   * Initializes the plugin. The base implementation does nothing.
   *
   * @param {*} ctx - Plugin initialization context.
   * @returns {Promise<void>} Resolves immediately.
   */
  async init(ctx) {}

  /**
   * Destroys the plugin. The base implementation does nothing.
   *
   * @returns {Promise<void>} Resolves immediately.
   */
  async destroy() {}
}

module.exports = BasePlugin;
class BasePlugin {
  constructor(config = {}) {
    this.config = config;
    this.name = "base-plugin";
  }

  async init(ctx) {}

  async destroy() {}
}

module.exports = BasePlugin;
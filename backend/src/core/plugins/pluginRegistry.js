const pluginManager = require(
  "./pluginManager"
);

const SlackPlugin = require(
  "../../plugins/slack/SlackPlugin"
);

/**
 * Registers the configured Slack plugin and initializes all plugins.
 *
 * @param {*} ctx - Context passed to plugin initialization.
 * @returns {Promise<void>} Resolves after plugin initialization.
 */
async function loadPlugins(
  ctx
) {
  pluginManager.register(
    new SlackPlugin({
      webhookUrl:
        process.env
          .SLACK_WEBHOOK_URL,
    })
  );

  await pluginManager.initAll(
    ctx
  );
}

module.exports = {
  loadPlugins,
};
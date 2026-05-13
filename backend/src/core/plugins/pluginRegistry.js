const pluginManager = require(
  "./pluginManager"
);

const SlackPlugin = require(
  "../../plugins/slack/SlackPlugin"
);

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
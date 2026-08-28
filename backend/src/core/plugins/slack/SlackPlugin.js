const BasePlugin = require(
  "../../core/plugins/basePlugins"
);

const axios = require("axios");

const EVENTS = require(
  "../../core/events/eventTypes"
);

/** Plugin that sends incident-created notifications to Slack. */
class SlackPlugin extends BasePlugin {
  /**
   * Creates a Slack plugin with the supplied webhook configuration.
   *
   * @param {Object} config - Plugin configuration containing an optional `webhookUrl`.
   */
  constructor(config) {
    super(config);

    this.name = "slack-plugin";
  }

  /**
   * Subscribes the plugin to incident-created events.
   *
   * @param {Object} ctx - Initialization context containing an event bus.
   * @returns {Promise<void>} Resolves after the subscription is registered.
   */
  async init(ctx) {
    const {
      eventBus,
    } = ctx;

    eventBus.on(
      EVENTS.INCIDENT_CREATED,
      async (incident) => {
        await this.sendIncidentAlert(
          incident
        );
      }
    );

    console.log(
      "[SLACK] Plugin ready"
    );
  }

  /**
   * Posts an incident-created message to the configured Slack webhook.
   *
   * @param {Object} incident - Incident payload used to build the message.
   * @returns {Promise<void>} Resolves after posting or logging a failed post.
   */
  async sendIncidentAlert(
    incident
  ) {
    if (!this.config.webhookUrl) {
      console.warn(
        "[SLACK] Missing webhook URL"
      );

      return;
    }

    try {
      await axios.post(
        this.config.webhookUrl,
        {
          text:
            `🚨 Incident Created\n` +
            `Service: ${incident.component_id}\n` +
            `Severity: ${incident.severity}\n` +
            `Message: ${incident.message}`,
        }
      );

      console.log(
        "[SLACK] Alert sent"
      );
    } catch (err) {
      console.error(
        "[SLACK] Failed:",
        err.message
      );
    }
  }
}

module.exports = SlackPlugin;
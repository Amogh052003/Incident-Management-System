const BasePlugin = require(
  "../../core/plugins/basePlugins"
);

const axios = require("axios");

const EVENTS = require(
  "../../core/events/eventTypes"
);

class SlackPlugin extends BasePlugin {
  constructor(config) {
    super(config);

    this.name = "slack-plugin";
  }

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
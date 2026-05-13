class SlackPlugin {
  constructor({ webhookUrl }) {
    this.name = "SlackPlugin";
    this.webhookUrl = webhookUrl;
  }

  async init(ctx) {
    console.log(`[SlackPlugin] Slack integration active`);
  }

  async sendMessage(text) {
    if (!this.webhookUrl) return;
    try {
      const fetch = (await import("node-fetch")).default;
      await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      console.error("[SlackPlugin] Failed to send message:", err.message);
    }
  }
}

module.exports = SlackPlugin;

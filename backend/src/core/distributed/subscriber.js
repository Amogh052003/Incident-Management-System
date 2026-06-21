const redis = require("../../db/redis");
const eventBus = require("../events/eventBus");
const EVENTS = require("../events/eventTypes");

async function initializeSubscriber() {
  const subscriber = redis.duplicate();

  await subscriber.subscribe("incident.created", "signal.ingested");

  subscriber.on("message", (channel, message) => {
    const payload = JSON.parse(message);

    console.log(`[REDIS] Received ${channel}: ${payload.componentId} - ${payload.message}`);

    if (channel === "incident.created") {
      eventBus.emit(EVENTS.INCIDENT_CREATED, payload);
    } else if (channel === "signal.ingested") {
      eventBus.emit(EVENTS.SIGNAL_INGESTED, payload);
    }
  });

  console.log("[REDIS] Subscriber initialized");
}

module.exports = {
  initializeSubscriber,
};
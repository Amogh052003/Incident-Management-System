const redis = require("../../db/redis");
const eventBus = require("../events/eventBus");
const EVENTS = require("../events/eventTypes");

async function initializeSubscriber() {
  const subscriber = redis.duplicate();

  await subscriber.subscribe("incident.created");

  subscriber.on("message", (channel, message) => {
    if (channel !== "incident.created") return;

    const payload = JSON.parse(message);

    console.log(
      "[REDIS] Received incident.created"
    );

    eventBus.emit(EVENTS.INCIDENT_CREATED, payload);
  });

  console.log("[REDIS] Subscriber initialized");
}

module.exports = {
  initializeSubscriber,
};
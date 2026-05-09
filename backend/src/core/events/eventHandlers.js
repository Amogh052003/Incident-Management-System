const eventBus = require("./eventBus");
const EVENTS = require("./eventTypes");

eventBus.on(EVENTS.INCIDENT_CREATED, (payload) => {
  console.log("[EVENT] INCIDENT_CREATED", payload);
});
const eventBus = require("../events/eventBus");
const EVENTS = require("../events/eventTypes");

const {
  markServiceDegraded,
} = require("./topologyServices");

eventBus.on(EVENTS.INCIDENT_CREATED, (payload) => {
  markServiceDegraded(
    payload.componentId,
    payload.incidentId
  );

  console.log(
    `[TOPOLOGY] ${payload.componentId} marked degraded`
  );
});
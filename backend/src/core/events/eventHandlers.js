const eventBus = require("./eventBus");
const EVENTS = require("./eventTypes");
const { logEvent } = require("../../services/auditService");

eventBus.on(EVENTS.INCIDENT_CREATED, async (payload) => {
  console.log("[EVENT] INCIDENT_CREATED", payload);

  await logEvent("incident", {
    component: payload.componentId,
    severity: payload.severity,
    message: `${payload.severity} incident #${payload.incidentId} created on ${payload.componentId}`,
    metadata: { incidentId: payload.incidentId },
  }).catch(() => {});
});

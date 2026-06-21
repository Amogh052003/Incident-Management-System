const eventBus = require("../events/eventBus");
const EVENTS = require("../events/eventTypes");

const { getIO } = require("./socketServer");

eventBus.on(EVENTS.INCIDENT_CREATED, (payload) => {
  const io = getIO();

  if (!io) return;

  io.emit("incident.created", payload);
});

eventBus.on(EVENTS.SIGNAL_INGESTED, (payload) => {
  const io = getIO();
  if (!io) return;

  console.log(`[SOCKET] Emitting log:new for ${payload.componentId}`);

  io.emit("log:new", {
    id: `signal-live-${Date.now()}`,
    source: "signal",
    type: "signal",
    component: payload.componentId,
    severity: payload.severity,
    message: payload.message,
    timestamp: new Date().toISOString(),
  });
});
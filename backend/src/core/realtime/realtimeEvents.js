const eventBus = require("../events/eventBus");
const EVENTS = require("../events/eventTypes");

const { getIO } = require("./socketServer");

eventBus.on(EVENTS.INCIDENT_CREATED, (payload) => {
  const io = getIO();

  if (!io) return;

  io.emit("incident.created", payload);

  console.log("[SOCKET] Broadcasted incident.created");
});
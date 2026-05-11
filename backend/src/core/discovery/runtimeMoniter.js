const Docker = require("dockerode");

const {
  updateResourceHealth,
  getResources,
} = require("../resources/resourceRegistry");

const eventBus = require("../events/eventBus");

const EVENTS = require("../events/eventTypes");

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

async function initializeRuntimeMonitor() {
  console.log(
    "[RUNTIME] Initializing runtime monitor"
  );

  const stream =
    await docker.getEvents();

  stream.on(
    "data",
    async (buffer) => {
      try {
        const event = JSON.parse(
          buffer.toString()
        );

        const {
          Type,
          Action,
          Actor,
        } = event;

        if (Type !== "container") {
          return;
        }

        const containerName =
          Actor?.Attributes?.name;

        if (!containerName) {
          return;
        }

        console.log(
          `[RUNTIME] ${containerName} -> ${Action}`
        );

        const resources =
          getResources();

        for (const resource of Object.values(
          resources
        )) {
          const runtimeInstances =
            resource.runtimeInstances || [];

          const matched =
            runtimeInstances.includes(
              containerName
            );

          if (!matched) {
            continue;
          }

          if (
            Action === "die" ||
            Action === "stop" ||
            Action === "kill"
          ) {
            updateResourceHealth(
              resource.id,
              "degraded"
            );

            eventBus.emit(
              EVENTS.INCIDENT_CREATED,
              {
                incidentId: `runtime-${Date.now()}`,

                componentId:
                  resource.id,

                severity: "P0",

                source:
                  "runtime-monitor",

                runtimeInstance:
                  containerName,

                timestamp:
                  Date.now(),
              }
            );
          }

          if (
            Action === "start" ||
            Action === "restart"
          ) {
            updateResourceHealth(
              resource.id,
              "healthy"
            );

            eventBus.emit(
              EVENTS.INCIDENT_RESOLVED,
              {
                componentId:
                  resource.id,

                runtimeInstance:
                  containerName,

                timestamp:
                  Date.now(),
              }
            );
          }
        }
      } catch (err) {
        console.error(
          "[RUNTIME] Error processing event",
          err
        );
      }
    }
  );

  console.log(
    "[RUNTIME] Monitoring Docker events"
  );
}

module.exports = {
  initializeRuntimeMonitor,
};
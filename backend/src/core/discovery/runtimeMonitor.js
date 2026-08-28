const Docker = require("dockerode");
const {
  registerResource,
  getResources,
  linkRuntimeInstance,
} = require("../resources/resourceRegistry");
const {
  propagateImpact,
} = require("../topology/impactPropagation");
const {
  transitionResource,
  RESOURCE_STATUS,
} = require("../registry/resourceLifecycle");

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

/**
 * Finds the resource whose runtime selector matches a container name.
 *
 * @param {string} containerName - Docker container name.
 * @param {Object} resources - Resources keyed by resource ID.
 * @returns {string|null} Matching resource ID, or null when none matches.
 */
function matchContainerToResource(
  containerName,
  resources
) {
  for (const [id, resource] of Object.entries(
    resources
  )) {
    if (!resource.runtimeSelector) continue;

    if (
      containerName.includes(
        resource.runtimeSelector
      )
    ) {
      return id;
    }
  }

  return null;
}

/**
 * Extracts a container or Kubernetes pod name from a Docker event.
 *
 * @param {Object} event - Docker event object.
 * @returns {string|null} Runtime name, or null when the event has no name.
 */
function getContainerName(event) {
  if (!event.Actor || !event.Actor.Attributes) return null;

  return (
    event.Actor.Attributes.name ||
    event.Actor.Attributes["io.kubernetes.pod.name"] ||
    null
  );
}

/**
 * Applies resource updates for a Docker container lifecycle event.
 *
 * @param {Object} event - Docker container event.
 * @returns {Promise<void>} Resolves after the event is handled.
 */
async function handleContainerEvent(event) {
  const containerName = getContainerName(event);

  if (!containerName) return;

  const action = event.Action;
  const resources = getResources();
  const matchedId = matchContainerToResource(
    containerName,
    resources
  );

  if (action === "start") {
    if (matchedId) {
      linkRuntimeInstance(matchedId, containerName);

      const resource = resources[matchedId];
      if (resource) {
        transitionResource(
          resource,
          RESOURCE_STATUS.HEALTHY
        );
      }
    } else {
      registerResource({
        id: containerName,

        type: "container",

        runtime: "docker",

        metadata: {
          image: event.from || "unknown",
        },

        health: {
          status: "healthy",
        },

        dependencies: [],
      });
    }
  } else if (
    action === "stop" ||
    action === "die" ||
    action === "kill"
  ) {
    if (matchedId) {
      const resource = resources[matchedId];
      if (resource) {
        transitionResource(
          resource,
          RESOURCE_STATUS.DEGRADED
        );
        propagateImpact(matchedId);
      }
    }

    if (resources[containerName]) {
      transitionResource(
        resources[containerName],
        RESOURCE_STATUS.DEGRADED
      );
      propagateImpact(containerName);
    }
  }
}

/**
 * Starts listening for relevant Docker container lifecycle events.
 *
 * Connection failures are logged and do not propagate to the caller.
 *
 * @returns {Promise<void>} Resolves after the Docker event stream is configured.
 */
async function initializeRuntimeMonitor() {
  try {
    const stream = await docker.getEvents();

    stream.on("data", (chunk) => {
      try {
        const event = JSON.parse(chunk.toString());

        if (
          event.Type === "container" &&
          ["start", "stop", "die", "kill"].includes(
            event.Action
          )
        ) {
          handleContainerEvent(event);
        }
      } catch (err) {
        // ignore parse errors on individual events
      }
    });

    stream.on("error", (err) => {
      console.warn(
        `[RUNTIME] Event stream error: ${err.message}`
      );
    });

    console.log(
      "[RUNTIME] Monitoring Docker events"
    );
  } catch (err) {
    console.warn(
      `[RUNTIME] Failed to connect: ${err.message}`
    );
  }
}

module.exports = {
  initializeRuntimeMonitor,
};

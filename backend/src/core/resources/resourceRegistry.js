const resources = require("./resourceStore");

/**
 * Adds or replaces a resource in the shared registry and initializes its health.
 *
 * @param {Object} resource - Resource object containing an `id` property.
 * @returns {void}
 */
function registerResource(resource) {
  resources[resource.id] = {
    ...resource,

    health: {
      status: "healthy",
      ...(resource.health || {}),
    },

    createdAt: Date.now(),
  };

  console.log(
    `[RESOURCE] Registered ${resource.id}`
  );
}

/**
 * Updates a registered resource's health status and update timestamp.
 *
 * @param {string} id - Resource identifier.
 * @param {string} status - New health status.
 * @returns {void}
 */
function updateResourceHealth(
  id,
  status
) {
  if (!resources[id]) {
    console.warn(
      `[RESOURCE] Unknown resource ${id}`
    );

    return;
  }
  resources[id].health.status =
    status;

  resources[id].health.updatedAt =
    Date.now();

  console.log(
    `[RESOURCE] ${id} -> ${status}`
  );
}

/**
 * Returns the shared resource registry object.
 *
 * @returns {Object} Resources keyed by resource identifier.
 */
function getResources() {
  return resources;
}

/**
 * Associates a runtime instance with a registered resource if not already linked.
 *
 * @param {string} resourceId - Resource identifier.
 * @param {string} instanceId - Runtime instance identifier.
 * @returns {void}
 */
function linkRuntimeInstance(
  resourceId,
  instanceId
) {
  if (!resources[resourceId]) {
    console.warn(
      `[RESOURCE] Cannot link — unknown resource ${resourceId}`
    );
    return;
  }

  if (!resources[resourceId].runtimeInstances) {
    resources[resourceId].runtimeInstances = [];
  }

  if (
    !resources[resourceId].runtimeInstances.includes(
      instanceId
    )
  ) {
    resources[resourceId].runtimeInstances.push(
      instanceId
    );

    console.log(
      `[RESOURCE] Linked ${instanceId} → ${resourceId}`
    );
  }
}

module.exports = {
  registerResource,
  updateResourceHealth,
  getResources,
  linkRuntimeInstance,
};
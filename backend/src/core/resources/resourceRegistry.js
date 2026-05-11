const resources = require("./resourceStore");

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

function getResources() {
  return resources;
}

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
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

module.exports = {
  registerResource,
  updateResourceHealth,
  getResources,
};
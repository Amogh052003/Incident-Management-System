const {
  discoverContainers,
} = require("./dockerDiscovery");

const {
  registerResource,
  getResources,
  linkRuntimeInstance,
} = require(
  "../resources/resourceRegistry"
);

function matchContainerToResource(
  containerName,
  resources
) {
  for (const [id, resource] of Object.entries(
    resources
  )) {
    if (!resource.runtimeSelector) continue;

    const selector =
      resource.runtimeSelector;

    if (containerName.includes(selector)) {
      return id;
    }
  }

  return null;
}

async function bootstrapDiscovery() {
  const containers =
    await discoverContainers();

  const logicalResources =
    getResources();

  for (const container of containers) {
    const matchedId =
      matchContainerToResource(
        container.name,
        logicalResources
      );

    if (matchedId) {
      linkRuntimeInstance(
        matchedId,
        container.name
      );
    } else {
      registerResource({
        id: container.name,

        type: "container",

        runtime: "docker",

        metadata: {
          image: container.image,
        },

        health: {
          status:
            container.state ===
            "running"
              ? "healthy"
              : "degraded",
        },

        dependencies: [],
      });
    }
  }

  console.log(
    `[DISCOVERY] Registered ${containers.length} containers`
  );
}

module.exports = {
  bootstrapDiscovery,
};
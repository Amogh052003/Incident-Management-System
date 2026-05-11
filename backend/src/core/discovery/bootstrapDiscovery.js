const {
  discoverContainers,
} = require("./dockerDiscovery");

const {
  registerResource,
} = require(
  "../resources/resourceRegistry"
);

async function bootstrapDiscovery() {
  const containers =
    await discoverContainers();

  for (const container of containers) {
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

  console.log(
    `[DISCOVERY] Registered ${containers.length} containers`
  );
}

module.exports = {
  bootstrapDiscovery,
};
const Docker = require("dockerode");

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

/**
 * Lists all Docker containers and returns selected runtime metadata.
 *
 * @returns {Promise<Array<Object>>} Container IDs, names, images, states, statuses, and networks.
 */
async function discoverContainers() {
  const containers =
    await docker.listContainers({
      all: true,
    });

  return containers.map(
    (container) => ({
      id: container.Id,

      name:
        container.Names[0]
          ?.replace("/", "") ||
        "unknown",

      image: container.Image,

      state: container.State,

      status: container.Status,

      networks: Object.keys(
        container.NetworkSettings
          ?.Networks || {}
      ),
    })
  );
}

module.exports = {
  discoverContainers,
};
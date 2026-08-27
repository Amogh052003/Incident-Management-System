const {
  updateResourceHealth,
  getResources,
} = require("../resources/resourceRegistry");

const {
  buildTopologyGraph,
} = require("./topologyGraph");

/**
 * Marks resources that depend transitively on a failed service as degraded.
 *
 * @param {string} failedService - Resource from which impact propagation starts.
 * @returns {string[]} IDs of resources reached through dependency edges.
 */
function propagateImpact(
  failedService
) {
  console.log(
    `[IMPACT] Propagating from ${failedService}`
  );

  const graph =
    buildTopologyGraph();

  const impacted =
    new Set();

  function dfs(current) {
    for (const [
      service,
      dependencies,
    ] of Object.entries(graph)) {
      if (
        dependencies.includes(
          current
        ) &&
        !impacted.has(service)
      ) {
        impacted.add(service);

        dfs(service);
      }
    }
  }

  dfs(failedService);

  for (const service of impacted) {
    updateResourceHealth(
      service,
      "degraded"
    );

    console.log(
      `[IMPACT] ${service} impacted by ${failedService}`
    );
  }

  return Array.from(impacted);
}

module.exports = {
  propagateImpact,
};
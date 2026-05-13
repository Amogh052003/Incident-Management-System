const {
  updateResourceHealth,
  getResources,
} = require("../resources/resourceRegistry");

const {
  buildTopologyGraph,
} = require("./topologyGraph");

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
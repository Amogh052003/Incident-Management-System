const {
  getResources,
} = require("../resources/resourceRegistry");

const {
  getDependencies,
} = require("./dependencyStore");

/**
 * Builds a graph containing every registered resource and its known dependencies.
 *
 * @returns {Object<string, string[]>} Resource dependency graph.
 */
function buildTopologyGraph() {
  const resources =
    getResources();

  const edges =
    getDependencies();

  const graph = {};

  for (const resource of Object.values(
    resources
  )) {
    graph[resource.id] =
      edges[resource.id] || [];
  }

  return graph;
}

module.exports = {
  buildTopologyGraph,
};
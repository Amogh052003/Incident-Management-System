const {
  getResources,
} = require("../resources/resourceRegistry");

function buildTopologyGraph() {
  const resources =
    getResources();

  const graph = {};

  for (const resource of Object.values(
    resources
  )) {
    graph[resource.id] =
      resource.dependencies || [];
  }

  return graph;
}

module.exports = {
  buildTopologyGraph,
};
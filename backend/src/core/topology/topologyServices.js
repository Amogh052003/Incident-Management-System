const { buildTopologyGraph } = require("./topologyGraph");
const {
  getResources,
  updateResourceHealth,
} = require("../resources/resourceRegistry");
const topologyState = require("./topologyStore");

function initializeTopology() {
  for (const service of Object.keys(buildTopologyGraph())) {
    topologyState[service] = {
      status: "healthy",
      incidents: [],
      lastUpdated: new Date(),
    };
  }

  console.log("[TOPOLOGY] Initialized");
}

function markServiceDegraded(service, incidentId) {
  if (!topologyState[service]) {
    console.warn(`[TOPOLOGY] Unknown service: ${service}`);
    return;
  }

  topologyState[service].status = "degraded";
  updateResourceHealth(service, "degraded");

  if (!topologyState[service].incidents.includes(incidentId)) {
    topologyState[service].incidents.push(incidentId);
  }

  topologyState[service].lastUpdated = new Date();
}

function markServiceHealthy(service) {
  if (!topologyState[service]) {
    console.warn(`[TOPOLOGY] Unknown service: ${service}`);
    return;
  }

  topologyState[service].status = "healthy";
  topologyState[service].incidents = [];
  topologyState[service].lastUpdated = new Date();
  updateResourceHealth(service, "healthy");
}

function getTopologyState() {
  const resources = getResources();
  const state = {};

  for (const [id, resource] of Object.entries(resources)) {
    state[id] = {
      status: resource.health?.status || "unknown",
      incidents: resource.incidents || [],
      lastUpdated: resource.health?.updatedAt || null,
    };
  }

  return state;
}

function getTopologyGraph() {
  return buildTopologyGraph();
}

module.exports = {
  initializeTopology,
  markServiceDegraded,
  markServiceHealthy,
  getTopologyState,
  getTopologyGraph,
};
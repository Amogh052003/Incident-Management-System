const topology = require("./topologyGraph");
const topologyState = require("./topologyStore");

function initializeTopology() {
  for (const service of Object.keys(topology)) {
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
}

function getTopologyState() {
  return topologyState;
}

function getTopologyGraph() {
  return topology;
}

module.exports = {
  initializeTopology,
  markServiceDegraded,
  markServiceHealthy,
  getTopologyState,
  getTopologyGraph,
};
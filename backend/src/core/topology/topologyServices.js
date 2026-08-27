const { buildTopologyGraph } = require("./topologyGraph");
const {
  getResources,
  updateResourceHealth,
} = require("../resources/resourceRegistry");
const topologyState = require("./topologyStore");

/**
 * Initializes topology state entries for all resources in the current graph.
 *
 * @returns {void}
 */
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

/**
 * Marks a known service as degraded and records an incident on it.
 *
 * @param {string} service - Service identifier.
 * @param {*} incidentId - Incident identifier to add to the service state.
 * @returns {void}
 */
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

/**
 * Marks a known service as healthy and clears its incident list.
 *
 * @param {string} service - Service identifier.
 * @returns {void}
 */
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

/**
 * Builds topology state from the current resource health and incident data.
 *
 * @returns {Object} State keyed by resource identifier.
 */
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

/**
 * Returns the current resource dependency graph.
 *
 * @returns {Object<string, string[]>} Resource dependency graph.
 */
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
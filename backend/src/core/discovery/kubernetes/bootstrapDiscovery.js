const {
  discoverCluster,
} = require("./K8sDiscovery");

async function bootstrapK8sDiscovery() {
  try {
    const data = await discoverCluster();
    console.log(`[K8S] Discovered ${data.pods.length} pods, ${data.services.length} services, ${data.deployments.length} deployments`);
    return data;
  } catch (err) {
    console.warn("[K8S] Discovery failed (K8s may not be available):", err.message);
    return { pods: [], services: [], deployments: [] };
  }
}

module.exports = {
  bootstrapK8sDiscovery,
};

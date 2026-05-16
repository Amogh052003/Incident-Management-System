const k8s = require("@kubernetes/client-node");
const { kc, clusterReady } = require("./K8sClient");
const { registerResource, getResources, linkRuntimeInstance } = require("../../resources/resourceRegistry");
const { propagateImpact } = require("../../topology/impactPropagation");

function matchPodToResource(podName, resources) {
  for (const [id, resource] of Object.entries(resources)) {
    if (!resource.runtimeSelector) continue;
    if (podName.includes(resource.runtimeSelector)) {
      return id;
    }
  }
  return null;
}

async function initializeK8sRuntimeMonitor() {
  if (!clusterReady) {
    console.log("[K8S-RUNTIME] No cluster — runtime monitoring disabled");
    return null;
  }

  const watch = new k8s.Watch(kc);

  const req = watch.watch(
    "/api/v1/pods",
    {},
    (type, apiObj) => {
      if (!apiObj || !apiObj.metadata) return;
      const podName = apiObj.metadata.name;
      const phase = apiObj.status?.phase;
      const isRunning = phase === "Running";
      const resources = getResources();

      const matchedId = matchPodToResource(podName, resources);

      if (type === "ADDED" || type === "MODIFIED") {
        if (isRunning) {
          if (matchedId) {
            linkRuntimeInstance(matchedId, podName);
          } else if (!resources[podName]) {
            registerResource({
              id: podName,
              type: "container",
              runtime: "kubernetes",
              runtimeSelector: null,
              runtimeAliases: [podName],
              metadata: {
                namespace: apiObj.metadata.namespace,
                image: apiObj.spec?.containers?.[0]?.image || "unknown",
                labels: apiObj.metadata.labels || {},
              },
              health: { status: "healthy" },
              dependencies: [],
            });
          }
        } else if (phase === "Failed" || phase === "Unknown") {
          if (matchedId) {
            propagateImpact(matchedId);
          }
          if (resources[podName]) {
            propagateImpact(podName);
          }
        }
      } else if (type === "DELETED") {
        if (matchedId) {
          propagateImpact(matchedId);
        }
        if (resources[podName]) {
          propagateImpact(podName);
        }
      }
    },
    (err) => {
      if (err) {
        console.warn("[K8S-RUNTIME] Watch error:", err.message);
      }
    }
  ).catch((err) => {
    console.warn("[K8S-RUNTIME] Failed to initialize:", err.message);
    return null;
  });

  console.log("[K8S-RUNTIME] Monitoring Kubernetes pod events");
  return req;
}

module.exports = {
  initializeK8sRuntimeMonitor,
};

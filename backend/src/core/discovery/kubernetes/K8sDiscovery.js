const {
  k8sApi,
  appsApi,
  clusterReady,
} = require("./K8sClient");

const {
  registerResource,
  getResources,
  linkRuntimeInstance,
} = require("../../resources/resourceRegistry");

const {
  addDependency,
} = require("../../topology/dependencyStore");

function matchPodToResource(podName, resources) {
  for (const [id, resource] of Object.entries(resources)) {
    if (!resource.runtimeSelector) continue;
    if (podName.includes(resource.runtimeSelector)) {
      return id;
    }
  }
  return null;
}

async function discoverCluster() {
  if (!clusterReady) {
    return { pods: [], services: [], deployments: [] };
  }

  console.log("[K8S] Discovering cluster");

  const [podsRes, servicesRes, deploymentsRes] = await Promise.all([
    k8sApi.listPodForAllNamespaces(),
    k8sApi.listServiceForAllNamespaces(),
    appsApi.listDeploymentForAllNamespaces(),
  ]);

  const pods = podsRes.items;
  const services = servicesRes.items;
  const deployments = deploymentsRes.items;

  console.log(`[K8S] Pods: ${pods.length}, Services: ${services.length}, Deployments: ${deployments.length}`);

  const logicalResources = getResources();

  for (const svc of services) {
    const svcName = svc.metadata.name;
    const svcNamespace = svc.metadata.namespace;

    if (!logicalResources[svcName]) {
      registerResource({
        id: svcName,
        type: "service",
        runtime: "kubernetes",
        runtimeSelector: null,
        runtimeAliases: [svcName, `${svcName}.${svcNamespace}`],
        metadata: {
          namespace: svcNamespace,
          labels: svc.metadata.labels || {},
        },
        health: { status: "healthy" },
        dependencies: [],
      });
    }
  }

  const discoveredPods = [];

  for (const pod of pods) {
    const podName = pod.metadata.name;
    const namespace = pod.metadata.namespace;
    const phase = pod.status.phase;
    const isRunning = phase === "Running";

    const matchedId = matchPodToResource(podName, logicalResources);

    if (matchedId) {
      linkRuntimeInstance(matchedId, podName);
    } else {
      registerResource({
        id: podName,
        type: "container",
        runtime: "kubernetes",
        runtimeSelector: null,
        runtimeAliases: [podName],
        metadata: {
          namespace,
          image: pod.spec.containers[0]?.image || "unknown",
          labels: pod.metadata.labels || {},
        },
        health: {
          status: isRunning ? "healthy" : "degraded",
        },
        dependencies: [],
      });
    }

    discoveredPods.push({
      name: podName,
      namespace,
      phase,
      containers: pod.spec.containers.map((c) => ({
        name: c.name,
        image: c.image,
        env: c.env || [],
      })),
    });
  }

  for (const svc of services) {
    const svcSelector = svc.spec.selector || {};
    const selectorKeys = Object.keys(svcSelector);
    if (selectorKeys.length === 0) continue;

    const svcName = svc.metadata.name;
    for (const pod of pods) {
      const podLabels = pod.metadata.labels || {};
      const matches = selectorKeys.every((k) => podLabels[k] === svcSelector[k]);
      if (matches) {
        addDependency(svcName, pod.metadata.name);
      }
    }
  }

  for (const deploy of deployments) {
    const deploySelector = deploy.spec.selector?.matchLabels || {};
    const selectorKeys = Object.keys(deploySelector);
    if (selectorKeys.length === 0) continue;

    const deployName = deploy.metadata.name;
    for (const pod of pods) {
      const podLabels = pod.metadata.labels || {};
      const matches = selectorKeys.every((k) => podLabels[k] === deploySelector[k]);
      if (matches) {
        addDependency(deployName, pod.metadata.name);
      }
    }
  }

  return {
    pods: discoveredPods,
    rawPods: pods,
    services,
    deployments,
  };
}

module.exports = {
  discoverCluster,
};

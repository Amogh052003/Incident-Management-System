const k8s = require(
  "@kubernetes/client-node"
);

const kc = new k8s.KubeConfig();

let k8sApi = null;
let appsApi = null;
let clusterReady = false;

if (process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT) {
  try {
    kc.loadFromCluster();
  } catch {
    kc.loadFromDefault();
  }
} else {
  kc.loadFromDefault();
}

const cluster = kc.getCurrentCluster();
if (cluster && cluster.server) {
  try {
    new URL(cluster.server);
    k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    appsApi = kc.makeApiClient(k8s.AppsV1Api);
    clusterReady = true;
    console.log("[K8S] Connected to cluster:", cluster.server);
  } catch {
    console.warn("[K8S] Invalid cluster server URL — K8s discovery disabled");
  }
} else {
  console.warn("[K8S] No valid cluster config found — K8s discovery disabled");
}

module.exports = {
  kc,
  k8sApi,
  appsApi,
  clusterReady,
};

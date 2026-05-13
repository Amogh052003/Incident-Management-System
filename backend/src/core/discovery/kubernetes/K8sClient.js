const k8s = require(
  "@kubernetes/client-node"
);

const kc = new k8s.KubeConfig();

try {
  kc.loadFromCluster();
} catch {
  kc.loadFromDefault();
}

const k8sApi =
  kc.makeApiClient(
    k8s.CoreV1Api
  );

const appsApi =
  kc.makeApiClient(
    k8s.AppsV1Api
  );

module.exports = {
  k8sApi,
  appsApi,
};
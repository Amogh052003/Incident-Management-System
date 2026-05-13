const {
  discoverCluster,
} = require(
  "./kubernetes/k8sDiscovery"
);

async function bootstrapDiscovery() {
  if (
    process.env
      .KUBERNETES_SERVICE_HOST
  ) {
    console.log(
      "[DISCOVERY] Kubernetes mode"
    );

    return await discoverCluster();
  }

  console.log(
    "[DISCOVERY] Local kubeconfig mode"
  );

  return await discoverCluster();
}

module.exports = {
  bootstrapDiscovery,
};

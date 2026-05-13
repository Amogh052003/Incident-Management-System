const {
  k8sApi,
  appsApi,
} = require("./k8sClient");

async function discoverCluster() {
  console.log(
    "[K8S] Discovering cluster"
  );

  const pods =
    await k8sApi.listPodForAllNamespaces();

  const services =
    await k8sApi.listServiceForAllNamespaces();

  const deployments =
    await appsApi.listDeploymentForAllNamespaces();

  console.log(
    `[K8S] Pods: ${pods.body.items.length}`
  );

  console.log(
    `[K8S] Services: ${services.body.items.length}`
  );

  console.log(
    `[K8S] Deployments: ${deployments.body.items.length}`
  );

  return {
    pods: pods.body.items,
    services:
      services.body.items,
    deployments:
      deployments.body.items,
  };
}

module.exports = {
  discoverCluster,
};
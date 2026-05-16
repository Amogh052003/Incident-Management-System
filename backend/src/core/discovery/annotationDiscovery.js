const RepoMapping = require("../../models/repoMapping");

const ANNOTATION_KEY = "ims.io/github-repo";

function extractRepoFromDeployment(deployment) {
  const annotations = deployment.metadata?.annotations || {};
  const repo = annotations[ANNOTATION_KEY];
  if (!repo) return null;
  const namespace = deployment.metadata?.namespace || "default";
  const serviceName =
    deployment.metadata?.labels?.["ims/service"] ||
    deployment.metadata?.name ||
    "";
  return { service: serviceName, repo, namespace };
}

async function discoverAnnotationsFromCluster(k8sData) {
  if (!k8sData || !k8sData.deployments) return [];
  const found = [];
  for (const dep of k8sData.deployments) {
    const extracted = extractRepoFromDeployment(dep);
    if (!extracted) continue;
    const parts = extracted.repo.split("/");
    try {
      await RepoMapping.findOneAndUpdate(
        { service: extracted.service },
        {
          service: extracted.service,
          repo: {
            owner: parts[0],
            name: parts.slice(1).join("/"),
            fullName: extracted.repo,
          },
          mappingSource: "annotation",
          namespace: extracted.namespace,
        },
        { upsert: true }
      );
      found.push(extracted);
    } catch (err) {
      console.warn(`[ANNOTATION] Failed to save mapping for ${extracted.service}: ${err.message}`);
    }
  }
  if (found.length > 0) {
    console.log(`[ANNOTATION] Discovered ${found.length} GitHub repo mappings from annotations`);
  }
  return found;
}

module.exports = { discoverAnnotationsFromCluster, extractRepoFromDeployment };

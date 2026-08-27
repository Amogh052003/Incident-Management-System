const RepoMapping = require("../../models/repoMapping");

/**
 * Kubernetes annotation used to associate a deployment with a GitHub repository.
 *
 * Expected annotation format:
 * `ims.io/github-repo: owner/repository`
 *
 * @constant
 * @type {string}
 */
const ANNOTATION_KEY = "ims.io/github-repo";

/**
 * Extracts GitHub repository information from a Kubernetes Deployment.
 *
 * The function reads the repository mapping from the deployment's
 * `ims.io/github-repo` annotation and determines the service name from
 * the `ims/service` label. If the label is not present, the deployment
 * name is used as the service name.
 *
 * @param {Object} deployment - Kubernetes Deployment object.
 * @param {Object} [deployment.metadata] - Deployment metadata.
 * @param {Object} [deployment.metadata.annotations] - Kubernetes annotations.
 * @param {Object} [deployment.metadata.labels] - Kubernetes labels.
 * @param {string} [deployment.metadata.namespace] - Kubernetes namespace.
 * @param {string} [deployment.metadata.name] - Deployment name.
 *
 * @returns {{service: string, repo: string, namespace: string}|null}
 * An object containing the service name, GitHub repository, and namespace.
 * Returns `null` when the GitHub repository annotation is not present.
 *
 * @example
 * const deployment = {
 *   metadata: {
 *     name: "incident-api",
 *     namespace: "production",
 *     annotations: {
 *       "ims.io/github-repo": "Amogh052003/Incident-Management-System"
 *     },
 *     labels: {
 *       "ims/service": "incident-api"
 *     }
 *   }
 * };
 *
 * const result = extractRepoFromDeployment(deployment);
 *
 * // {
 * //   service: "incident-api",
 * //   repo: "Amogh052003/Incident-Management-System",
 * //   namespace: "production"
 * // }
 */
function extractRepoFromDeployment(deployment) {
  const annotations = deployment.metadata?.annotations || {};
  const repo = annotations[ANNOTATION_KEY];

  if (!repo) return null;

  const namespace = deployment.metadata?.namespace || "default";

  const serviceName =
    deployment.metadata?.labels?.["ims/service"] ||
    deployment.metadata?.name ||
    "";

  return {
    service: serviceName,
    repo,
    namespace,
  };
}

/**
 * Discovers GitHub repository mappings from Kubernetes Deployments.
 *
 * Each deployment is inspected for the `ims.io/github-repo` annotation.
 * When a mapping is found, it is persisted to MongoDB using the
 * {@link RepoMapping} model.
 *
 * Existing mappings are updated and new mappings are created using an
 * upsert operation.
 *
 * @async
 * @param {Object} k8sData - Kubernetes discovery result.
 * @param {Array<Object>} [k8sData.deployments] - Kubernetes Deployments
 * to inspect.
 *
 * @returns {Promise<Array<{
 *   service: string,
 *   repo: string,
 *   namespace: string
 * }>>}
 * List of repository mappings successfully discovered from annotations.
 *
 * @example
 * const k8sData = {
 *   deployments: [
 *     {
 *       metadata: {
 *         name: "incident-api",
 *         namespace: "production",
 *         annotations: {
 *           "ims.io/github-repo": "Amogh052003/Incident-Management-System"
 *         },
 *         labels: {
 *           "ims/service": "incident-api"
 *         }
 *       }
 *     }
 *   ]
 * };
 *
 * const mappings = await discoverAnnotationsFromCluster(k8sData);
 *
 * // [
 * //   {
 * //     service: "incident-api",
 * //     repo: "Amogh052003/Incident-Management-System",
 * //     namespace: "production"
 * //   }
 * // ]
 */
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
      console.warn(
        `[ANNOTATION] Failed to save mapping for ${extracted.service}: ${err.message}`
      );
    }
  }

  if (found.length > 0) {
    console.log(
      `[ANNOTATION] Discovered ${found.length} GitHub repo mappings from annotations`
    );
  }

  return found;
}

module.exports = {
  discoverAnnotationsFromCluster,
  extractRepoFromDeployment,
};
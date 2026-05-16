const {
  resolveIdentity,
} = require("../identityResolver");

const {
  addDependency,
} = require("../../topology/dependencyStore");

function extractHost(value) {
  if (!value) return null;
  const match = value.match(/(?:postgres:\/\/|redis:\/\/|http:\/\/|https:\/\/)?([^:/]+)/i);
  return match?.[1] || null;
}

async function discoverK8sDependencies(discoveredPods) {
  console.log("[K8S-DEPS] Discovering dependencies from pod env vars");

  let totalEdges = 0;

  for (const pod of discoveredPods) {
    const source = pod.name;

    for (const container of pod.containers) {
      for (const envVar of container.env) {
        const host = extractHost(envVar.value);
        if (!host) continue;

        const resolved = resolveIdentity(host);
        if (resolved && resolved !== source) {
          addDependency(source, resolved);
          totalEdges++;
        }
      }
    }
  }

  if (totalEdges > 0) {
    console.log(`[K8S-DEPS] Inferred ${totalEdges} dependency edges`);
  }

  return totalEdges;
}

module.exports = {
  discoverK8sDependencies,
};

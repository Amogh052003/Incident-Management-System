const Docker = require("dockerode");

const {
  getResources,
} = require("../resources/resourceRegistry");

const {
  resolveIdentity,
} = require("./identityResolver");

const {
  addDependency,
} = require("../topology/dependencyStore");

const docker = new Docker({
  socketPath:
    "/var/run/docker.sock",
});

function extractHost(value) {
  if (!value) {
    return null;
  }

  const match =
    value.match(
      /(?:postgres:\/\/|redis:\/\/|http:\/\/|https:\/\/)?([^:/]+)/i
    );

  return match?.[1] || null;
}

async function discoverDependencies(k8sPods) {
  console.log(
    "[DISCOVERY] Discovering dependencies"
  );

  const containers =
    await docker.listContainers();

  const resources =
    getResources();

  for (const container of containers) {
    const inspect =
      await docker
        .getContainer(container.Id)
        .inspect();

    const containerName =
      inspect.Name.replace("/", "");

    const envs =
      inspect.Config.Env || [];

    let sourceResource = null;

    for (const resource of Object.values(
      resources
    )) {
      const instances =
        resource.runtimeInstances || [];

      if (
        instances.includes(
          containerName
        )
      ) {
        sourceResource =
          resource.id;

        break;
      }
    }

    if (!sourceResource) {
      continue;
    }

    const inferred =
      new Set();

    for (const env of envs) {
      const parts =
        env.split("=");

      const value = parts[1];

      const host =
        extractHost(value);

      if (!host) {
        continue;
      }

      const resolved =
        resolveIdentity(host);

      if (
        resolved &&
        resolved !== sourceResource
      ) {
        inferred.add(resolved);
        addDependency(
          sourceResource,
          resolved
        );
      }
    }

    resources[
      sourceResource
    ].inferredDependencies =
      Array.from(inferred);

    console.log(
      `[DISCOVERY] Docker: ${sourceResource} ->`,
      Array.from(inferred)
    );
  }

  if (k8sPods && k8sPods.length > 0) {
    console.log("[DISCOVERY] Discovering K8s pod dependencies");

    for (const pod of k8sPods) {
      const sourceResource = resources[pod.name] ? pod.name : null;
      if (!sourceResource) continue;

      const inferred = new Set();

      for (const container of pod.containers) {
        const envVars = container.env || [];
        for (const envVar of envVars) {
          const host = extractHost(envVar.value);
          if (!host) continue;

          const resolved = resolveIdentity(host);
          if (resolved && resolved !== sourceResource) {
            inferred.add(resolved);
            addDependency(sourceResource, resolved);
          }
        }
      }

      if (inferred.size > 0) {
        console.log(
          `[DISCOVERY] K8s: ${sourceResource} ->`,
          Array.from(inferred)
        );
      }
    }
  }
}

module.exports = {
  discoverDependencies,
};

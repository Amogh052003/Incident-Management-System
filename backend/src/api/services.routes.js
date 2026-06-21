const express = require("express");
const Docker = require("dockerode");
const { getResources } = require("../core/resources/resourceRegistry");
const { getDependencies } = require("../core/topology/dependencyStore");
const { k8sApi } = require("../core/discovery/kubernetes/K8sClient");
const { getTopologyState } = require("../core/topology/topologyServices");
const { pgPool } = require("../db/postgres");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const router = express.Router();

async function getDockerContainers() {
  try {
    return await docker.listContainers({ all: true });
  } catch {
    return [];
  }
}

async function getK8sPods() {
  try {
    const res = await k8sApi.listPodForAllNamespaces();
    return res.items || [];
  } catch {
    return [];
  }
}

function getServiceRuntimeInfo(serviceId, resources, dockerContainers, k8sPods) {
  const res = resources[serviceId];
  if (!res) return null;

  const instances = res.runtimeInstances || [];
  const runtimeInfo = [];

  for (const instance of instances) {
    let type = "unknown";
    if (dockerContainers.some((c) => (c.Names || []).some((n) => n.replace("/", "") === instance))) {
      type = "docker";
    } else if (k8sPods.some((p) => p.metadata.name === instance)) {
      type = "kubernetes";
    }
    runtimeInfo.push({ type, name: instance });
  }

  return {
    instances: runtimeInfo,
    type: res.type,
    runtime: res.runtime,
    aliases: res.runtimeAliases || [],
    metadata: res.metadata || {},
  };
}

async function getContainerUptime(containerName, containers) {
  try {
    const container = containers.find((c) =>
      (c.Names || []).some((n) => n.replace("/", "") === containerName)
    );
    if (!container) return null;

    const inspect = await docker.getContainer(container.Id).inspect();
    const startedAt = inspect.State.StartedAt;
    const status = inspect.State.Status;

    return {
      status,
      startedAt,
      uptime: startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) : null,
    };
  } catch {
    return null;
  }
}

async function getContainerMetrics(containerName, containers) {
  try {
    const container = containers.find((c) =>
      (c.Names || []).some((n) => n.replace("/", "") === containerName)
    );
    if (!container) return null;

    const stats = await docker.getContainer(container.Id).stats({ stream: false });

    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100 : 0;

    const memUsage = stats.memory_stats.usage || 0;
    const memLimit = stats.memory_stats.limit || 1;
    const memPercent = (memUsage / memLimit) * 100;

    const rxBytes = (stats.networks || {}).eth0?.rx_bytes || 0;
    const txBytes = (stats.networks || {}).eth0?.tx_bytes || 0;

    return {
      cpu: { usage: Math.round(cpuPercent * 100) / 100, cores: stats.cpu_stats.online_cpus },
      memory: { usage: memUsage, limit: memLimit, usagePercent: Math.round(memPercent * 100) / 100 },
      network: { rxBytes, txBytes },
    };
  } catch {
    return null;
  }
}

async function getK8sPodUptime(podName, pods) {
  try {
    const pod = pods.find((p) => p.metadata.name === podName);
    if (!pod) return null;

    const startTime = pod.status.startTime;
    const phase = pod.status.phase;
    const conditions = (pod.status.conditions || []).map((c) => ({
      type: c.type,
      status: c.status,
      lastTransitionTime: c.lastTransitionTime,
    }));

    return {
      status: phase,
      startedAt: startTime,
      uptime: startTime ? Math.floor((Date.now() - new Date(startTime).getTime()) / 1000) : null,
      conditions,
      nodeName: pod.spec.nodeName,
      hostIP: pod.status.hostIP,
      podIP: pod.status.podIP,
    };
  } catch {
    return null;
  }
}

async function getK8sPodMetrics(podName, pods) {
  try {
    const pod = pods.find((p) => p.metadata.name === podName);
    if (!pod) return null;

    const containerResources = (pod.spec.containers || []).map((c) => ({
      name: c.name,
      cpuRequest: c.resources?.requests?.cpu || null,
      cpuLimit: c.resources?.limits?.cpu || null,
      memoryRequest: c.resources?.requests?.memory || null,
      memoryLimit: c.resources?.limits?.memory || null,
    }));

    const restartCount = (pod.status.containerStatuses || []).reduce(
      (sum, cs) => sum + (cs.restartCount || 0), 0
    );

    return {
      containers: containerResources,
      restartCount,
    };
  } catch {
    return null;
  }
}

router.get("/services/:name", async (req, res) => {
  const { name } = req.params;
  const resources = getResources();
  const dependencies = getDependencies();
  const topologyState = getTopologyState();

  const resource = resources[name];
  if (!resource) {
    return res.status(404).json({ error: "Service not found" });
  }

  const [dockerContainers, k8sPods] = await Promise.all([
    getDockerContainers(),
    getK8sPods(),
  ]);

  const runtimeInfo = getServiceRuntimeInfo(name, resources, dockerContainers, k8sPods);
  const state = topologyState[name] || { status: "unknown", incidents: [], lastUpdated: null };

  const dependents = [];
  for (const [src, targets] of Object.entries(dependencies)) {
    if (targets.includes(name) && src !== name) {
      dependents.push(src);
    }
  }
  const deps = (dependencies[name] || []).filter((d) => d !== name);

  let uptime = null;
  let metrics = null;

  if (runtimeInfo) {
    for (const inst of runtimeInfo.instances) {
      if (inst.type === "docker") {
        uptime = await getContainerUptime(inst.name, dockerContainers);
        metrics = await getContainerMetrics(inst.name, dockerContainers);
      } else if (inst.type === "kubernetes") {
        uptime = await getK8sPodUptime(inst.name, k8sPods);
        metrics = await getK8sPodMetrics(inst.name, k8sPods);
      }
      if (uptime) break;
    }
  }

  res.json({
    id: name,
    type: resource.type,
    aliases: resource.runtimeAliases || [],
    metadata: resource.metadata || {},
    health: resource.health || { status: "unknown" },
    state,
    dependencies: deps,
    dependents,
    instances: runtimeInfo?.instances || [],
    uptime,
    metrics,
    createdAt: resource.createdAt,
  });
});

router.get("/services/:name/logs", async (req, res) => {
  const { name } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const resources = getResources();
  const resource = resources[name];

  if (!resource) {
    return res.status(404).json({ error: "Service not found" });
  }

  const logs = [];

  const instances = resource.runtimeInstances || [];

  for (const instName of instances) {
    try {
      const containers = await docker.listContainers({ all: true });
      const container = containers.find((c) =>
        (c.Names || []).some((n) => n.replace("/", "") === instName)
      );
      if (container) {
        const containerLogs = await docker.getContainer(container.Id).logs({
          stdout: true,
          stderr: true,
          tail: limit,
          timestamps: true,
        });
        const lines = containerLogs.toString().split("\n").filter(Boolean);
        for (const line of lines) {
          const tsMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
          logs.push({
            source: instName,
            type: "container",
            timestamp: tsMatch ? tsMatch[1] : new Date().toISOString(),
            message: line.replace(/^\S+\s+/, "").trim(),
          });
        }
      }
    } catch {}
  }

  try {
    const podsRes = await k8sApi.listPodForAllNamespaces();
    const pod = (podsRes.items || []).find((p) => p.metadata.name === instName);
    if (pod) {
      const namespace = pod.metadata.namespace;
      for (const container of pod.spec.containers || []) {
        try {
          const k8sLogs = await k8sApi.readNamespacedPodLog(
            pod.metadata.name, namespace, container.name,
            undefined, undefined, undefined, undefined, undefined, undefined, undefined, limit
          );
          const lines = (k8sLogs.body || "").split("\n").filter(Boolean);
          for (const line of lines) {
            logs.push({
              source: `${instName}/${container.name}`,
              type: "kubernetes",
              timestamp: new Date().toISOString(),
              message: line,
            });
          }
        } catch {}
      }
    }
  } catch {}

  try {
    const result = await pgPool.query(
      `SELECT component, message, created_at, severity
       FROM audit_logs
       WHERE component = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [name, limit]
    );
    for (const row of result.rows) {
      logs.push({
        source: name,
        type: "audit",
        timestamp: row.created_at,
        message: row.message,
        severity: row.severity,
      });
    }
  } catch {}

  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(logs.slice(0, limit));
});

module.exports = router;

const RESOURCE_STATUS = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNHEALTHY: "unhealthy",
  STOPPED: "stopped",
  UNKNOWN: "unknown",
};

const VALID_TRANSITIONS = {
  unknown: ["healthy", "degraded", "stopped"],
  healthy: ["degraded", "unhealthy", "stopped"],
  degraded: ["healthy", "unhealthy", "stopped"],
  unhealthy: ["healthy", "degraded", "stopped"],
  stopped: ["healthy"],
};

function canTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to);
}

function transitionResource(resource, newStatus) {
  if (!resource.health) {
    resource.health = {};
  }

  const currentStatus = resource.health.status || RESOURCE_STATUS.UNKNOWN;

  if (!canTransition(currentStatus, newStatus)) {
    console.warn(
      `[LIFECYCLE] Invalid transition ${currentStatus} -> ${newStatus}`
    );

    return false;
  }

  resource.health.status = newStatus;
  resource.updatedAt = new Date().toISOString();
  resource.lastSeenAt = new Date().toISOString();

  if (newStatus === RESOURCE_STATUS.DEGRADED) {
    resource.degradedAt = new Date().toISOString();
  }

  console.log(
    `[LIFECYCLE] ${resource.id} ${currentStatus} -> ${newStatus}`
  );

  return true;
}

module.exports = {
  RESOURCE_STATUS,
  transitionResource,
  canTransition,
};

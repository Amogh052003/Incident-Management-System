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

/**
 * Checks whether a resource health status transition is allowed.
 *
 * @param {string} from - Current status.
 * @param {string} to - Proposed status.
 * @returns {boolean} Whether the transition is listed as valid.
 */
function canTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to);
}

/**
 * Applies a valid health transition and updates resource timestamps.
 *
 * @param {Object} resource - Resource with an optional `health` object.
 * @param {string} newStatus - Target health status.
 * @returns {boolean} Whether the transition was applied.
 */
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

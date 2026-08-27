const dependencies = {};

/**
 * Adds a unique directed dependency from one resource to another.
 *
 * @param {string} from - Resource that depends on the target.
 * @param {string} to - Resource depended upon.
 * @returns {void}
 */
function addDependency(
  from,
  to
) {
  if (!dependencies[from]) {
    dependencies[from] = [];
  }

  if (
    !dependencies[from].includes(to)
  ) {
    dependencies[from].push(to);
  }
}

/**
 * Returns the in-memory dependency map.
 *
 * @returns {Object<string, string[]>} Dependency targets keyed by source resource.
 */
function getDependencies() {
  return dependencies;
}

module.exports = {
  addDependency,
  getDependencies,
};

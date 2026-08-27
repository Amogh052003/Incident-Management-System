const {
  getResources,
} = require("../resources/resourceRegistry");

/**
 * Resolves a runtime hostname to a registered resource using aliases and DNS prefixes.
 *
 * @param {string} name - Runtime hostname or alias.
 * @returns {string|null} Matching resource ID, or `null` when unresolved.
 */
function resolveIdentity(name) {
  if (!name) return null;

  const resources = getResources();
  const normalized = name.toLowerCase();

  for (const resource of Object.values(resources)) {
    const aliases = resource.runtimeAliases || [];

    const matched = aliases.some((alias) => {
      const a = alias.toLowerCase();
      return a === normalized || normalized.startsWith(a + ".");
    });

    if (matched) return resource.id;
  }

  const firstSegment = normalized.split(".")[0];
  if (firstSegment !== normalized) {
    for (const resource of Object.values(resources)) {
      const aliases = resource.runtimeAliases || [];
      const matched = aliases.some((alias) => alias.toLowerCase() === firstSegment);
      if (matched) return resource.id;
    }
  }

  return null;
}

module.exports = {
  resolveIdentity,
};

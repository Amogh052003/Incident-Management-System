const {
  getResources,
} = require("../resources/resourceRegistry");

function resolveIdentity(name) {
  if (!name) {
    return null;
  }

  const resources =
    getResources();

  const normalized =
    name.toLowerCase();

  for (const resource of Object.values(
    resources
  )) {
    const aliases =
      resource.runtimeAliases || [];

    const matched =
      aliases.some(
        (alias) =>
          alias.toLowerCase() ===
          normalized
      );

    if (matched) {
      return resource.id;
    }
  }

  return null;
}

module.exports = {
  resolveIdentity,
};

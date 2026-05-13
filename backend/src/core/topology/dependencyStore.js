const dependencies = {};

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

function getDependencies() {
  return dependencies;
}

module.exports = {
  addDependency,
  getDependencies,
};

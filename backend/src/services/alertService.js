const P0Strategy = require("../strategies/p0Strategy");
const P1Strategy = require("../strategies/p1Strategy");
const P2Strategy = require("../strategies/p2Strategy");

function getStrategy(component_id) {
  if (component_id.includes("database") || component_id.includes("payment") || component_id.includes("auth")) {
    return new P0Strategy();
  }

  if (component_id.includes("api-gateway") || component_id.includes("cache")) {
    return new P1Strategy();
  }

  return new P2Strategy(); // default
}

function triggerAlert(signal) {
  const strategy = getStrategy(signal.component_id);

  strategy.sendAlert(signal);
  return strategy.getSeverity();
}

module.exports = { triggerAlert };
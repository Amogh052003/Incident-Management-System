const P0Strategy = require("../strategies/p0Strategy");
const P2Strategy = require("../strategies/p2Strategy");

function getStrategy(component_id) {
  if (component_id.includes("DB")) {
    return new P0Strategy();
  }

  if (component_id.includes("CACHE")) {
    return new P2Strategy();
  }

  return new P2Strategy(); // default
}

function triggerAlert(signal) {
  const strategy = getStrategy(signal.component_id);

  strategy.sendAlert(signal);
}

module.exports = { triggerAlert };
const P0Strategy = require("../strategies/p0Strategy");
const P1Strategy = require("../strategies/p1Strategy");
const P2Strategy = require("../strategies/p2Strategy");

/**
 * Creates an alert strategy based on component name substrings.
 *
 * @param {string} component_id - Component identifier to classify.
 * @returns {Object} P0, P1, or P2 alert strategy instance.
 */
function getStrategy(component_id) {
  if (component_id.includes("database") || component_id.includes("payment") || component_id.includes("auth")) {
    return new P0Strategy();
  }

  if (component_id.includes("api-gateway") || component_id.includes("cache")) {
    return new P1Strategy();
  }

  return new P2Strategy(); // default
}

/**
 * Sends an alert through the strategy selected for a signal.
 *
 * @param {Object} signal - Signal containing a `component_id` and alert context.
 * @returns {string} Severity reported by the selected strategy.
 */
function triggerAlert(signal) {
  const strategy = getStrategy(signal.component_id);

  strategy.sendAlert(signal);
  return strategy.getSeverity();
}

module.exports = { triggerAlert };
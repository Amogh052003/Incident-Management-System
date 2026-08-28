const AlertStrategy = require("./alertStrategy");

/** Alert strategy for high-priority P1 incidents. */
class P1Strategy extends AlertStrategy {
  constructor() {
    super();
    this.severity = 'P1';
  }

  /**
   * Logs a high-priority alert and simulated engineering notification.
   *
   * @param {Object} context - Alert context containing component and message fields.
   * @returns {void}
   */
  sendAlert(context) {
    console.log("P1 ALERT: High priority issue");
    console.log(`Component: ${context.component_id}`);
    console.log(`Message: ${context.message}`);

    // simulate notification
    console.log("Notifying engineering team!");
  }
}

module.exports = P1Strategy;
/** Base strategy for severity-specific alert handling. */
class AlertStrategy {
    constructor() {
      this.severity = 'P2'; // default
    }

    /**
     * Defines the alert operation for a concrete strategy.
     *
     * @param {Object} context - Alert context passed by the caller.
     * @returns {void}
     * @throws {Error} Always, because the base strategy has no implementation.
     */
    sendAlert(context) {
      throw new Error("sendAlert() must be implemented");
    }

    /**
     * Returns this strategy's severity.
     *
     * @returns {string} The configured severity.
     */
    getSeverity() {
      return this.severity;
    }
  }

  module.exports = AlertStrategy;
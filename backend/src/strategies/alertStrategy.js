class AlertStrategy {
    constructor() {
      this.severity = 'P2'; // default
    }

    sendAlert(context) {
      throw new Error("sendAlert() must be implemented");
    }

    getSeverity() {
      return this.severity;
    }
  }

  module.exports = AlertStrategy;
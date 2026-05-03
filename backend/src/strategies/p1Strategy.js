const AlertStrategy = require("./alertStrategy");

class P1Strategy extends AlertStrategy {
  constructor() {
    super();
    this.severity = 'P1';
  }

  sendAlert(context) {
    console.log("P1 ALERT: High priority issue");
    console.log(`Component: ${context.component_id}`);
    console.log(`Message: ${context.message}`);

    // simulate notification
    console.log("Notifying engineering team!");
  }
}

module.exports = P1Strategy;
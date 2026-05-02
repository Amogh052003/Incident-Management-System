const AlertStrategy = require("./alertStrategy");

class P0Strategy extends AlertStrategy {
  constructor() {
    super();
    this.severity = 'P0';
  }

  sendAlert(context) {
    console.log("🚨 P0 ALERT: CRITICAL FAILURE");
    console.log(`Component: ${context.component_id}`);
    console.log(`Message: ${context.message}`);
    
    // simulate escalation
    console.log("🔥 Paging on-call engineer immediately!");
  }
}

module.exports = P0Strategy;
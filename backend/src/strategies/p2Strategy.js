const AlertStrategy = require("./alertStrategy");

class P2Strategy extends AlertStrategy {
  sendAlert(context) {
    console.log("⚠️ P2 ALERT: Non-critical issue");
    console.log(`Component: ${context.component_id}`);
    
    // simulate softer handling
    console.log("📧 Logging and notifying via email");
  }
}

module.exports = P2Strategy;
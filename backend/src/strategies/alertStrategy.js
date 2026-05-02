class AlertStrategy {
    sendAlert(context) {
      throw new Error("sendAlert() must be implemented");
    }
  }
  
  module.exports = AlertStrategy;
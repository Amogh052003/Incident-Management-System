const BaseState = require("./baseState");

class OpenState extends BaseState {
  async transition(newStatus, data) {
    if (newStatus === "INVESTIGATING") {
      return {
        status: "INVESTIGATING",
        start_time: this.workItem.start_time || new Date(),
      };
    }

    throw new Error("Invalid transition from OPEN");
  }
}

module.exports = OpenState;
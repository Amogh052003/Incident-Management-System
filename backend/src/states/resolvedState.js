const BaseState = require("./baseState");

class ResolvedState extends BaseState {
  async transition(newStatus, data) {
    if (newStatus === "CLOSED") {
      return {
        status: "CLOSED",
        end_time: new Date(),
      };
    }

    throw new Error("Invalid transition from RESOLVED");
  }
}

module.exports = ResolvedState;
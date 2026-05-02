const BaseState = require("./baseState");

class ResolvedState extends BaseState {
  async transition(newStatus, data) {
    if (newStatus === "CLOSED") {
      if (!data.rca) {
        throw new Error("RCA required to close incident");
      }

      return {
        status: "CLOSED",
        end_time: new Date(),
        rca: data.rca,
      };
    }

    throw new Error("Invalid transition from RESOLVED");
  }
}

module.exports = ResolvedState;
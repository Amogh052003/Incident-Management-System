const BaseState = require("./baseState");

class InvestigatingState extends BaseState {
  async transition(newStatus, data) {
    if (newStatus === "RESOLVED") {
      if (
        !data.rca ||
        !data.rca.root_cause?.trim() ||
        !data.rca.fix?.trim() ||
        !data.rca.prevention?.trim()
      ) {
        throw new Error("RCA is required to resolve an incident");
      }

      return {
        status: "RESOLVED",
        start_time: this.workItem.start_time || new Date(),
        rca: data.rca,
      };
    }

    throw new Error("Invalid transition from INVESTIGATING");
  }
}

module.exports = InvestigatingState;

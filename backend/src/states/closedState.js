const BaseState = require("./baseState");

class ClosedState extends BaseState {
  async transition() {
    throw new Error("Incident already CLOSED. No further transitions allowed.");
  }
}

module.exports = ClosedState;
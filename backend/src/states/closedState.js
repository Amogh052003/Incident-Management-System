const BaseState = require("./baseState");

/** State representing a work item that cannot transition further. */
class ClosedState extends BaseState {
  /**
   * Rejects all transitions from a closed work item.
   *
   * @returns {Promise<never>} Never resolves because closed items cannot transition.
   * @throws {Error} Always, because the incident is already closed.
   */
  async transition() {
    throw new Error("Incident already CLOSED. No further transitions allowed.");
  }
}

module.exports = ClosedState;
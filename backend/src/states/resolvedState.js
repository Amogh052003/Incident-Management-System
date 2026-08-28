const BaseState = require("./baseState");

/** State for a resolved work item awaiting closure. */
class ResolvedState extends BaseState {
  /**
   * Closes a resolved work item.
   *
   * @param {string} newStatus - Requested next status.
   * @param {*} data - Additional transition data, which is not used here.
   * @returns {Promise<Object>} The closed status and end time update.
   * @throws {Error} When the requested transition is not `CLOSED`.
   */
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
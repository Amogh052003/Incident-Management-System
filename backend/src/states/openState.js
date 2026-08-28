const BaseState = require("./baseState");

/** State for a work item that can transition to investigation. */
class OpenState extends BaseState {
  /**
   * Moves an open work item to investigation.
   *
   * @param {string} newStatus - Requested next status.
   * @param {*} data - Additional transition data, which is not used here.
   * @returns {Promise<Object>} The status and start time update.
   * @throws {Error} When the requested transition is not supported.
   */
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
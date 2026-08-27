class BaseState {
  /**
   * Creates a state wrapper for a work item.
   *
   * @param {Object} workItem - Work item associated with the state.
   */
    constructor(workItem) {
      this.workItem = workItem;
    }
  
    /**
     * Defines the transition operation for a concrete state.
     *
     * @param {string} newStatus - Requested next status.
     * @param {*} data - Additional transition data.
     * @returns {Promise<never>} Never resolves in the base implementation.
     * @throws {Error} Always, because the transition is not implemented.
     */
    async transition(newStatus, data) {
      throw new Error("Transition not implemented");
    }
  }
  
  module.exports = BaseState;
class BaseState {
    constructor(workItem) {
      this.workItem = workItem;
    }
  
    async transition(newStatus, data) {
      throw new Error("Transition not implemented");
    }
  }
  
  module.exports = BaseState;
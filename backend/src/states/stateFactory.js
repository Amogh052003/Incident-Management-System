const OpenState = require("./openState");
const InvestigatingState = require("./investigatingState");
const ResolvedState = require("./resolvedState");
const ClosedState = require("./closedState");

/**
 * Creates the state object corresponding to a work item's status.
 *
 * @param {Object} workItem - Work item whose `status` selects the state class.
 * @returns {Object} A state instance for the work item.
 * @throws {Error} When the status is not supported.
 */
function getState(workItem) {
  switch (workItem.status) {
    case "OPEN":
      return new OpenState(workItem);
    case "INVESTIGATING":
      return new InvestigatingState(workItem);
    case "RESOLVED":
      return new ResolvedState(workItem);
    case "CLOSED":
      return new ClosedState(workItem);
    default:
      throw new Error("Unknown state");
  }
}

module.exports = { getState };
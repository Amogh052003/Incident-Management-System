const OpenState = require("./openState");
const InvestigatingState = require("./investigatingState");
const ResolvedState = require("./resolvedState");
const ClosedState = require("./closedState");

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
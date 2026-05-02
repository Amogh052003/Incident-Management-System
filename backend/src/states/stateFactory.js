const OpenState = require("./openState");
const ResolvedState = require("./resolvedState");
const ClosedState = require("./closedState");

function getState(workItem) {
  switch (workItem.status) {
    case "OPEN":
      return new OpenState(workItem);
    case "RESOLVED":
      return new ResolvedState(workItem);
    case "CLOSED":
      return new ClosedState(workItem);
    default:
      throw new Error("Unknown state");
  }
}

module.exports = { getState };
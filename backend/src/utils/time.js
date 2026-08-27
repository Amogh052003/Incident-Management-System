/**
 * Returns the current time as an ISO 8601 string.
 *
 * @returns {string} The current time in ISO format.
 */
function now() {
    return new Date().toISOString();
  }
  
  module.exports = { now };
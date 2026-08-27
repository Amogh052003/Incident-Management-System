let count = 0;

/** Increments the module-level signal counter. */
function increment() {
  count++;
}

/**
 * Reads the signal counter and resets it to zero.
 *
 * @returns {number} The count before it was reset.
 */
function getAndReset() {
  const current = count;
  count = 0;
  return current;
}

module.exports = { increment, getAndReset };
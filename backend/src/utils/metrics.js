let count = 0;

function increment() {
  count++;
}

function getAndReset() {
  const current = count;
  count = 0;
  return current;
}

module.exports = { increment, getAndReset };
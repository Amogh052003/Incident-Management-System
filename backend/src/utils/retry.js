/**
 * Runs an asynchronous operation again after failures using exponential backoff.
 *
 * @param {Function} fn - Operation to invoke.
 * @param {number} [retries=3] - Maximum number of attempts.
 * @param {number} [delay=100] - Initial delay in milliseconds.
 * @returns {Promise<*>} The value returned by the successful operation.
 * @throws {*} The error from the final failed attempt.
 */
async function retry(fn, retries = 3, delay = 100) {
    let attempt = 0;
  
    while (attempt < retries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
  
        console.error(`❌ Attempt ${attempt} failed`);
  
        if (attempt === retries) {
          throw err;
        }
  
        // exponential backoff
        const waitTime = delay * Math.pow(2, attempt);
  
        console.log(`⏳ Retrying in ${waitTime}ms...`);
  
        await new Promise((res) => setTimeout(res, waitTime));
      }
    }
  }
  
  module.exports = retry;
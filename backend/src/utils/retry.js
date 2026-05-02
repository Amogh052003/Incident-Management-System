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
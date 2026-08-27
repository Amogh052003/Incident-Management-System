global.crypto = require("crypto").webcrypto;
const { processSignal } = require("../services/signalService");
const { connectMongo } = require("../db/mongo");
const { getAndReset } = require("../utils/metrics");
const RawSignal = require("../models/rawSignal");
const redis = require("../db/redis");
require("../core/events/eventHandlers");
require("../core/topology/topologyEvents");
const {
  bootstrapResources,
} = require(
  "../core/resources/bootstrapResources"
);
const {
  initializeTopology,
} = require("../core/topology/topologyServices");
/**
 * Connects to MongoDB, consumes JSON signals from Redis, stores raw payloads,
 * and passes valid signals to the signal processor.
 *
 * The worker continues consuming after malformed messages or processing errors.
 *
 * @returns {Promise<never>} Runs continuously while the worker is active.
 */
async function startWorker() {
  await connectMongo();

  console.log(" Worker started");

  setInterval(() => {
    const count = getAndReset();

    if (count > 0) {
      console.log(`Throughput: ${count / 5} signals/sec`);
    }
  }, 5000);

  while (true) {
    try {
      const data = await redis.brpop("signal_queue", 0);

      if (!data || !data[1]) continue;

      let signal;

      try {
        signal = JSON.parse(data[1]);
      } catch (err) {
        console.error("Invalid JSON:", data[1]);
        continue;
      }

      // Store raw signal in MongoDB
      await RawSignal.create({
        payload: signal,
        timestamp: new Date(),
      });

      await processSignal(signal);

    } catch (err) {
      console.error("Worker error:", err);

      // prevent tight crash loop
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}

bootstrapResources();
initializeTopology();

startWorker();
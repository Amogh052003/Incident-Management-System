const redis = require("../../db/redis");

/**
 * Publishes a JSON-serialized payload to a Redis channel.
 *
 * @param {string} channel - Redis channel.
 * @param {*} payload - Value to serialize and publish.
 * @returns {Promise<number>} Redis publish result.
 */
async function publish(channel, payload) {
  await redis.publish(
    channel,
    JSON.stringify(payload)
  );
}

module.exports = {
  publish,
};
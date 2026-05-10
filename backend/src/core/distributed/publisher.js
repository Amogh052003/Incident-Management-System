const redis = require("../../db/redis");

async function publish(channel, payload) {
  await redis.publish(
    channel,
    JSON.stringify(payload)
  );
}

module.exports = {
  publish,
};
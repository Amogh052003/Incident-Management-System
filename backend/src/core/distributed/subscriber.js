const redis = require("../../db/redis");

const { getIO } = require("../realtime/socketServer");

async function initializeSubscriber() {
  const subscriber = redis.duplicate();

  await subscriber.connect();

  await subscriber.subscribe(
    "incident.created",
    async (message) => {
      const payload = JSON.parse(message);

      console.log(
        "[REDIS] Received incident.created"
      );

      const io = getIO();

      if (io) {
        io.emit("incident.created", payload);

        console.log(
          "[SOCKET] Broadcasted incident.created"
        );
      }
    }
  );

  console.log("[REDIS] Subscriber initialized");
}

module.exports = {
  initializeSubscriber,
};
let io = null;

/**
 * Creates the Socket.IO server and logs client connections and disconnections.
 *
 * @param {Object} server - HTTP server passed to Socket.IO.
 * @returns {void}
 */
function initializeSocket(server) {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[SOCKET] Realtime server initialized");
}

/**
 * Returns the initialized Socket.IO server instance.
 *
 * @returns {Object|null} Socket.IO instance or `null` before initialization.
 */
function getIO() {
  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};
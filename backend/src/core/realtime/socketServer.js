let io = null;

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

function getIO() {
  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};
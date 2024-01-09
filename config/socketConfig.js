const { Server } = require("socket.io");

function configureSocket(server, clientURL) {
  const io = new Server(server, {
    cors: {
      origin: clientURL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`WebSocket client connected with ID ${socket.id}`);

    socket.on("disconnect", () => {
      console.log("a user disconnected");
    });
  });

  io.on("connection", (socket) => {
    // Handle the "profileImageUpdated" message when received
    socket.on("profileImageUpdated", (data) => {
      console.log("Received profileImageUpdated message with data:", data);

      // Broadcast the message to all connected WebSocket clients
      socket.broadcast.emit("profileImageUpdated", data);

      // Emit the message back to the sender
      socket.emit("profileImageUpdated", data);
    });
  });

  return io;
}

module.exports = configureSocket;

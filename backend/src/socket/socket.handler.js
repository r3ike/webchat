export function registerChatHandlers(io, socket) {
  socket.on("send_message", async data => {
    // logica socket-only
  });
}
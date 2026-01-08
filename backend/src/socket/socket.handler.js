export function registerChatHandlers(io, socket) {
  socket.on("send_message", async data => {
    // logica socket-only
  });

  socket.on("change_chat", async data => {
    /**
     * Emesso dal client quando cmabia chat
     * 
     * fa il leave dalla vecchia room e fa il join nella nuova
     * 
     * data deve contenere l'id della conversazione precedente e quella della nuova converzazione
     * 
     * room name: chat:{id_conversazione}
     */
  })
}
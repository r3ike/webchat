let io;

export function setSocketServer(_io) {
  io = _io;
}

export function emitToRoom(room, event, payload) {
  if (!io) throw new Error("Socket non inizializzato");
  io.to(room).emit(event, payload);
}
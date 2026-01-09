let io;

const socket_event = {
    NEW_MESSAGE_NOTIFICATION:"new_message_notification",    //Manda solo la notifica ai membri della chat con payload contenente l'id della conversazione
    NEW_MESSAGE:"new_message",  //Manda la notifica a tutti gli utenti che hanno attualmente aperta la chat, come payload manda anche il messaggio
    TYPING:"typing",
    CHAT_UPDATE:"chat_update"
}

export function setSocketServer(_io) {
    io = _io;
}

/**
 * 
 */
export function emitNewMessageEvent(members,convId ,senderId, textMsg) {
    //Emit notifiche
    members.forEach(memberId => {
        emitToRoom(`user:${memberId}`,socket_event.NEW_MESSAGE_NOTIFICATION, {
            convId
        })
    });

    //Emit a tutti gli utenti con la chat aperta
    emitToRoom(`chat:${convId}`, socket_event.NEW_MESSAGE, {
        senderId,
        text: textMsg
    })
}

export function emitUpdateChatEvent(params) {

}

export function emitTypingEvent(params) {

}

function emitToRoom(room, event, payload) {
    if (!io) throw new Error("Socket non inizializzato");
    io.to(room).emit(event, payload);
}
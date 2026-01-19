let io;


/**
 * Differenza tra chat_update e msg_update:
 *  - chat_update: notifica la modifica di una chat => fa partire la get che prende solo le info della chat senza messaggi
 *  - msg_update: notifica la modifica di un messaggio => fa partire la get che prende tutti i messaggi di quella chat
 */
const socket_event = {
    NEW_MESSAGE:"new_message",  //Manda la notifica a tutti gli utenti che hanno attualmente aperta la chat, come payload manda anche il messaggio
    TYPING:"typing",
    CHAT_UPDATE:"chat_update",   //Usata per notificare un update su una chat (es: cambio nome, nuovo ultimo messaggio ecc...) nel payload c'è la convId
    MSG_UPDATE:"msg_update"     //Usata per notificare la modifica o l'eliminazione di un messaggio, nel payload viene passato l'id della conversazione
}

export function setSocketServer(_io) {
    io = _io;
}

/**
 * bisogna emettere tutto il messaggio preso dal db
 */
export function emitNewMessageEvent(members,convId ,msg) {
    //Emit notifiche
    members.forEach(memberId => {
        emitToRoom(`user:${memberId}`,socket_event.CHAT_UPDATE, {
            convId
        })
    });

    //Emit a tutti gli utenti con la chat aperta
    emitToRoom(`chat:${convId}`, socket_event.NEW_MESSAGE, {
        msg
    })
}

export function emitUpdateChatEvent(members, convId) {
    members.forEach(memberId => {
        emitToRoom(`user:${memberId}`,socket_event.CHAT_UPDATE, {
            convId
        })
    });
}

export function emitMsgUpdateEvent(convId) {
    emitToRoom(`chat:${convId}`, socket_event.MSG_UPDATE, {convId})
}

export function emitTypingEvent(convId, userId) {
    emitToRoom(`chat:${convId}`, socket_event.TYPING, {userId})
}

function emitToRoom(room, event, payload) {
    if (!io) throw new Error("Socket non inizializzato");
    io.to(room).emit(event, payload);
}
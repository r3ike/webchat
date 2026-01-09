import {updateUserLastSeen, getAllChatMembers, createMessage, updateLastMessage} from "../services/db.service.js"

import { emitNewMessageEvent, emitTypingEvent } from "./socket.emitter.js";

export function registerChatHandlers(io, socket) {
    socket.on("send_message", async data => {
        /**
         * Inviato dal client quando invia un nuovo messaggio
         * 
         * data conterrà: convId, text 
         * 
         * cose da fare:
         *  - check se l'utente fa parte della conv
         *  - aggiungere al db il msg
         *  - update lastMessage della conv
         *  - emit di un messaggio alla room
         */

        const userId = socket.user._id
        const convId = data.convId
        const textMsg = data.text
        try {
            const members = await getAllChatMembers(convId)

            if (!members.includes(userId)) {
                //Gestire il caso in cui il sender non sia membro della chat
                return
            }

            const msgId = await createMessage(convId, userId, textMsg)
            await updateLastMessage(convId, msgId)

            emitNewMessageEvent(members, convId, userId, textMsg)

        } catch (error) {
            console.log(error);
            return
        }
    });

    socket.on("change_chat", async data => {
        /**
         * Emesso dal client quando cambia chat
         * 
         * fa il leave dalla vecchia room e fa il join nella nuova
         * 
         * data deve contenere l'id della conversazione precedente e quella della nuova converzazione
         * 
         * room name: chat:{id_conversazione}
         */
        const userId = socket.user._id
        const convPrev = data.convPrev  //Conversazione che aveva aperta prima
        const convAtt = data.convAtt    //Conversazione aperta dall'utente
        
        /**
         * Nel caso sia la prima chat aperta, es all'apertura della chat, la chat prev è null
         */
        if(convPrev !== null){
            socket.leave(convPrev)
        }

        socket.join(convAtt)
    })

    socket.on("typing", async data => {
        /**
         * Inviato dal client quando un utente sta scrivendo
         * 
         * nel data sarà presente l'id della conversazione in cui sta scrivendo
         * 
         * verrà emesso un typing socket a tutti gli utenti online su quella chat
         */

        const userId = socket.user._id
        const convId = data.convId

        emitTypingEvent(convId, userId)
    })


    socket.on("disconnect", async () => {
        const userId = socket.user._id
        try {
            await updateUserLastSeen(userId)        //Viene aggiornato anche al disconnect così è il più reale possibile
        } catch (error) {
            console.log(error);
            
        }

        socket.leave(`user:${userId}`) 
    })
}
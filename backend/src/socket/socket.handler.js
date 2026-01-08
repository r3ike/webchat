import {updateUserLastSeen} from "../services/db.service.js"

export function registerChatHandlers(io, socket) {
    socket.on("send_message", async data => {
        // logica socket-only
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
    })

    socket.on("typing", async data => {
        
    })


    socket.on("disconnect", async () => {
        const userId = socket.user._id
        try {
            await updateUserLastSeen(userId)        //Viene aggiornato anche al disconnect così è il più reale possibile
        } catch (error) {
            console.log(error);
            
        }
    })
}
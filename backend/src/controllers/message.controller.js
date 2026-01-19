import {isUserChatMember,getAllMessagesByConvId, getAllReadBy, deleteMessageById, updateAllReadBy, getMsgSender, getConvIdByMsgId, getConversationCreatorIdAndType} from "../services/db.service.js"

import { emitMsgUpdateEvent } from "../socket/socket.emitter.js";
/**
 * Richiesta per tutta i messaggi di una chat => fatta all'apertura di una chat
 * 
 * Aggiorna il readBy
 */
export async function getAllMsgController(req,res) {
    const userId = req.user._id

    const convId = req.params.convId
    
    
    try {
        /**
         * validazione
         * controllare se l'utente è membro di quella conversazione
         */
        if (!await isUserChatMember(convId, userId)) {
            return res.status(400).json({message: "Solo i membri della chat possono visualizzare i messaggi!"})
        }

        const msg = await getAllMessagesByConvId(convId)

        await updateAllReadBy(convId, userId)   //Quando si pare una chat si visualizzano tutti i messaggi inviati precedentemente

        return res.status(200).json(msg)

    } catch (error) {
        console.log(error);

        return res.status(400).json({message: "Errore nella richiesta per i messaggi della chat!"})
    }
}

/**
 * Get readBy con un msgId specifico
 */
export async function getAllReadByController(req,res) {
    const userId = req.user._id
    const msgId =  req.params.msgId
    
    try {
        
        const senderId = await getMsgSender(msgId)
        console.log(senderId);
        

        if (senderId !== userId) {
            return res.status(400).json({message:"Solo chi ha inviato il messaggio può vedere i visualizzatori!"})
        }

        const reader = await getAllReadBy(msgId)

        return res.status(200).json(reader)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Errore nella richiesta!"})
    }
}

/**
 * Delete message 
 */
export async function deleteMsgController(req,res) {
    const userId = req.user._id

    const msgId = req.body.msgId
    /**
     * Validazione => controllare se l'id dell'utente è il sender del messaggio
     */
    try {
        const senderId = await getMsgSender(msgId)
        const convId = await getConvIdByMsgId(msgId)
        const {convCreator, type} = await getConversationCreatorIdAndType(convId)

        /**
         * Validazione fatta:
         * - se l'utente è chi ha mandato il messaggio => può eliminare il msg
         * - se il tipo di chat è un gruppo e userId è quello del creatore della chat => può elimare i msg degli altri
         */
        if (userId !== senderId && !(type === "group" && userId === convCreator)) {
            return res.status(400).json({message:"Solo chi ha inviato il messaggio può eliminare il messaggio"})
        }

        await deleteMessageById(msgId)

        emitMsgUpdateEvent(convId)

        return res.status(200).json({message:"Messaggio eliminato con successo"})
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message:"errore nell'eliminazione del messaggio"})
    }
}
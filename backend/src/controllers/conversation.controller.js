import { getAllChatByUserId, getChatByIdAndByUserId, createConversation, getAllChatMembers, addChatMember, removeChatMember, deleteConversation, getConversationCreatorIdAndType } from "../services/db.service.js"

import { emitUpdateChatEvent } from "../socket/socket.emitter.js";
/**
 * Usata all'apertura della chat
 */
export async function getAllConversationsController(req, res) {
    const userId = req.user._id

    try {
        const chats = await getAllChatByUserId(userId)

        chats.forEach(chat => {
            if (chat.type === "private" && !chat.name) {
                const otherMember = chat.members.find(
                    m => m._id.toString() !== userId
                )
                if (otherMember) chat.name = otherMember.username
            }
        })

        return res.status(200).json(chats)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Errore nella richiesta per le chat!" })
    }
}
/**
 * In caso di update di una chat es: nuovo membro o cambio nome...
 */
export async function getConversationsByIdController(req, res) {
    const userId = req.user._id
    const convId = req.params.convId

    try {
        const chat = await getChatByIdAndByUserId(userId, convId)


        if (chat.type === "private" && !chat.name) {
            const otherMember = chat.members.find(
                m => m._id.toString() !== userId
            )
            if (otherMember) chat.name = otherMember.username
        }


        return res.status(200).json(chat)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Errore nella richiesta per le chat!" })
    }
}

export async function createConversationController(req, res) {
    const userId = req.user._id
    const name = req.body.name
    const type = req.body.type
    const members = req.body.members //array di id dei membri

    /**
     * validazione: il type può esseere solo private / group
     */

    if (type !== "group" && type !== "private") {
        return res.status(400).json({ message: "Errore nel tipo di chat!" })
    }

    //Nel caso in cui la chat sia di tipo private ci deve essere per forza un membro
    if (type === "private" && members.length != 1) {
        return res.status(400).json({ message: "In una chat privata sei obbligato ad avere un membro!" })
    }

    if (!members.includes(userId)) {
        members.push(userId)
    }

    try {
        const conversation = await createConversation(userId, members, name, type)

        emitUpdateChatEvent(members, conversation._id)

        return res.status(200).json({ message: "Chat creata con successo!" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Errore nella richiesta per creare una chat!" })
    }
}

export async function addChatMemberController(req, res) {
    const userId = req.user._id

    const membersId = req.body.memberId
    const convId = req.body.convId

    /**
     * Validazione
     */
    try {
        const { convCreator, type } = await getConversationCreatorIdAndType(convId)

        if (convCreator !== userId) {
            return res.status(400).json({ message: "Solo il creatore della chat può aggiungere membri dalla chat!" })
        }
        //L'aggiunta e la rimozione dei membri è ammessa solo nella chat di tipo group
        if (type === "private") {
            return res.status(400).json({ message: "La chat è di tipo privato!" })
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Chat non trovata!" })
    }

    try {
        await addChatMember(convId, membersId)

        const members = await getAllChatMembers(convId)

        emitUpdateChatEvent(members, convId)

        return res.status(200).json({ message: "Membri aggiunti con successo!" })
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Errore nell'aggiunta dei membri!" })
    }
}

export async function removeChatMemberController(req, res) {
    const userId = req.user._id

    const memberId = req.body.memberId
    const convId = req.body.convId

    /**
     * Validazione
     */
    try {
        const { convCreator, type } = await getConversationCreatorIdAndType(convId)

        /**
         * solo il creatore del gruppo può rimuovere membri dal gruppo 
         * l'unico caso in cui un utente può rimuovere un membro è quando abbandona il gruppo => rimuove se stesso
         */
        if (convCreator !== userId && memberId !== userId) {
            return res.status(400).json({ message: "Solo il creatore della chat può togliere membri dalla chat!" })
        }

        //Il creatore non può rimuoversi dal gruppo => può solo eliminarlo
        if (memberId === convCreator) {
            return res.status(400).json({ message: "Non si può rimuovere il creatore!" })
        }

        //L'aggiunta e la rimozione dei membri è ammessa solo nella chat di tipo group
        if (type === "private") {
            return res.status(400).json({ message: "La chat è di tipo privato!" })
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Chat non trovata!" })
    }

    try {
        await removeChatMember(convId, memberId)

        const members = await getAllChatMembers(convId)

        emitUpdateChatEvent(members, convId)

        return res.status(200).json({ message: "Membri rimossi con successo!" })
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Errore nella rimozione dei membri!" })
    }
}

export async function deleteConversationController(req, res) {
    const userId = req.user._id

    const convId = req.body.convId

    /**
     * Validazione
     */
    try {
        const { convCreator, type } = await getConversationCreatorIdAndType(convId)

        if (convCreator !== userId) {
            return res.status(400).json({ message: "Solo il creatore della chat può eliminare la chat!" })
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Chat non trovata!" })
    }

    try {
        await deleteConversation(convId)

        const members = await getAllChatMembers(convId)

        emitUpdateChatEvent(members, convId)

        return res.status(200).json({ message: "Chat eliminata con successo!" })
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Errore nell'eliminazione della chat!" })
    }

}
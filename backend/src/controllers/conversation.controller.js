import {getAllChatByUserId, createConversation, addChatMember, removeChatMember, deleteConversation, getConversationCreatorId} from "../services/db.service.js"

export async function getAllConversationsController(req,res) {
    const userId = req.user._id

    try {
        const chats = await getAllChatByUserId(userId)
        console.log(chats);
        
        return res.status(200).json(chats)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Errore nella richiesta per le chat!"})
    }
}

export async function createConversationController(req,res) {
    const userId = req.user._id
    const name = req.body.name
    const type = req.body.type
    const members = req.body.members //array di id dei membri
    
    /**
     * validazione: il type può esseere solo private / group
     */

    if (type !== "group" && type !== "private") {
        return res.status(400).json({message:"Errore nel tipo di chat!"})
    }

    //Nel caso in cui la chat sia di tipo private ci deve essere per forza un membro
    if(type === "private" && members.length != 1){
        return res.status(400).json({message:"In una chat privata sei obbligato ad avere un membro!"})
    }

    if (!members.includes(userId)) {
        members.push(userId)
    }

    try {
        await createConversation(userId, members, name, type)

        return res.status(200).json({message:"Chat creata con successo!"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Errore nella richiesta per creare una chat!"})       
    }
}

export async function addChatMemberController(req,res) {
    const userId = req.user._id

    const membersId = req.body.memberId
    const convId = req.body.convId

    /**
     * Validazione
     */
    try {
        const convCreator = await getConversationCreatorId(convId)
    
        if (convCreator !== userId) {
            return res.status(400).json({message:"Solo il creatore della chat può togliere membri dalla chat!"})
        }
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message: "Chat non trovata!"})
    }    

    try {
        await addChatMember(convId, membersId)

        return res.status(200).json({message: "Membri aggiunti con successo!"})
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message: "Errore nell'aggiunta dei membri!"})
    }
}

export async function removeChatMemberController(req,res) {
    const userId = req.user._id

    const memberId = req.body.memberId
    const convId = req.body.convId

    /**
     * Validazione
     */
    try {
        const convCreator = await getConversationCreatorId(convId)
    
        if (convCreator !== userId) {
            return res.status(400).json({message:"Solo il creatore della chat può togliere membri dalla chat!"})
        }
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message: "Chat non trovata!"})
    }
    
    try {
        await removeChatMember(convId, memberId)

        return res.status(200).json({message: "Membri rimossi con successo!"})
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message: "Errore nella rimozione dei membri!"})
    }
}

export async function deleteConversationController(req,res) {
    const userId = req.user._id

    const convId = req.body.convId

    /**
     * Validazione
     */
    try {
        const convCreator = await getConversationCreatorId(convId)
    
        if (convCreator !== userId) {
            return res.status(400).json({message:"Solo il creatore della chat può togliere membri dalla chat!"})
        }
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message: "Chat non trovata!"})
    }

    try {
        await deleteConversation(convId)

        return res.status(200).json({message: "Chat eliminata con successo!"})
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message: "Errore nell'eliminazione della chat!"})
    }

}
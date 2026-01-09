import { User } from "../models/User.js"
import { Conversation } from "../models/Conversation.js"
import { Message } from "../models/Message.js"

/*-----------------------------------------------------------*/
/*                  USERS DATABASE QUERY
/*-----------------------------------------------------------*/

//Get profilo utente attraverso id
export async function getUserById(id) {
    return User.findById(id).lean()
}

//Get profilo utente attraverso username => usato per verificare la password
export async function getUserByUsername(username) {
    return User.findOne({ username: username }).lean()
}

//Get profilo utente completo => senza password => con amici e inviti
export async function getCompleteUserByUsername(username) {
    return User.findOne({ username: username })
        .populate("friends", "username nome cognome email")
        .populate("pendingInvites", "username")
        .select("-password")
        .lean()
}

//Get profilo utente attraverso email
export async function getUserByEmail(email) {
    return User.findOne({ email: email }).lean()
}

//Aggiunta di un profilo utente => chiamata durate il registr
export async function insertUser(nome, cognome, email, password, username) {
    await User.create({
        username: username,
        nome: nome,
        cognome: cognome,
        email: email,
        password: password
    })
}

//Update di un profilo utente
export async function updateUserById(userId, newData) {
    await User.findByIdAndUpdate(userId, newData)
}

export async function updateUserLastSeen(userId) {
    await User.findByIdAndUpdate(userId, { 
        $set: { lastSeen: new Date.now() } 
    })
}

/**
 * Eliminazione profilo utente
 * - Eliminare anche da tutte le liste di amicizie degli altri
 * - Eliminare da tutte le member list delle chat
 */
export async function deleteUserById(userId) {
    await User.findByIdAndDelete(userId)
}

/**
 * Query per inviare un invito di amicizia:
 *  - aggiunge nella lista delle richieste di amicizia del "destUserId" il srcUserId
 */
export async function sendFriendInvite(srcUserId, destUserId) {
    await User.findByIdAndUpdate(destUserId, {
        $addToSet: { pendingInvites: srcUserId }
    })
}

export async function isInPendingInvitesList(userId, senderInviteId) {
    return await User.find({
        _id: userId,
        pendingInvites: {$in: [senderInviteId]}
    }).lean()

}

/**
 * Query per accettare un invito di amicizia
 */
export async function acceptFriendInvite(userId, inviteSenderId) {
    //Aggiungemo a entrmbi gli utenti l'amicizia
    await Promise.all([
        User.findByIdAndUpdate(userId, {
            $pull: { pendingInvites: inviteSenderId },
            $addToSet: { friends: inviteSenderId }
        }),

        User.findByIdAndUpdate(inviteSenderId, {
            $addToSet: { friends: userId }
        })
    ])
}

/**
 * Query per declinare un invito di amicizia
 */
export async function declineFriendInvite(userId, inviteSenderId) {
    User.findByIdAndUpdate(userId, {
        $pull: { pendingInvites: inviteSenderId }
    })
}

/**
 * Query per rimuovere un amico
 */
export async function removeFriend(userId, friendId) {
    //Togliamo da entrembe le liste di amici 
    await Promise.all([
        User.findByIdAndUpdate(userId, {
            $pull: { friends: friendId }
        }),

        User.findByIdAndUpdate(friendId, {
            $pull: { friends: userId }
        })
    ])
}

/*-----------------------------------------------------------*/
/*              CONVERSATIONS DATABASE QUERY
/*-----------------------------------------------------------*/

//Creazione nuova conversazione
export async function createConversation(userId, membersIds, name, type) {
    const conversation = await Conversation.create({
        name: name,
        type: type,
        createdBy: userId,
        members: membersIds
    })

    return conversation
}

/**
 * Eliminazione della conversazione => elimina tutti i messaggi di quella chat
 */
export async function deleteConversation(convId) {
    await Promise.all([
        Conversation.findByIdAndDelete(convId),
        Message.deleteMany({ conversationId: convId })
    ])
}
/**
 * Query per prendere l'id del creatore di una chat
 * usato per l'eliminazione di una chat => una chat può essere eliminata solo dal suo creatore
 */
export async function getConversationCreatorIdAndType(convId) {
    const conv = await Conversation.findById(convId).lean()
    const userId = conv.createdBy.toString()
    const type = conv.type

    return { userId, type }
}

/**
 * $addToSet => aggiungi senza duplicati
 * $each     => prende l’array e aggiunge ogni elemento singolarmente  => Controllare come si comporta con un singolo elem
 */

export async function addChatMember(convId, newMemberIdArray) {
    const newMemberCasted = Array.isArray(newMemberIdArray) ? newMemberIdArray : [newMemberIdArray]
    await Conversation.findByIdAndUpdate(convId, {
        $addToSet: { members: { $each: newMemberCasted } }
    })
}

export async function removeChatMember(convId, memberId) {
    await Conversation.findByIdAndUpdate(convId, {
        $pull: { members: memberId }
    })
}

//Usata quando si per aggiornare l'ultimo messaggio inviato nella chat => Verificare se è necessario il campo lastMessage nello schema mongodb
export async function updateLastMessage(convId, msgId) {
    await Conversation.findByIdAndUpdate(convId, { lastMessage: msgId })
}

//Funzione che prende tutte le chat SENZA massaggi di un utente => usato per popolare la barra laterale del frontend
export async function getAllChatByUserId(userId) {
    return await Conversation.find({ members: { $in: [userId] } })
        .populate("createdBy", "username")
        .populate("members", "username nome cognome")
        .populate("lastMessage", "sender text createdAt")
        .sort({ "lastMessage.createdAt": -1 })
        .lean()
}

//Funzione che prende una chat specifica SENZA massaggi di un utente => usato per aggiornare la barra laterale del frontend
export async function getChatByIdAndByUserId(userId, convId) {
    return await Conversation.find({
        _id: convId,
        members: { $in: [userId] }
    })
        .populate("createdBy", "username")
        .populate("members", "username nome cognome")
        .populate("lastMessage", "sender text createdAt")
        .sort({ "lastMessage.createdAt": -1 })
        .lean()
}

export async function getAllChatMembers(convId) {
    const conversation = await Conversation.findById(convId).lean()

    return conversation.members.map(id => id.toString())
}

export async function isUserChatMember(convId, userId) {
    return await Conversation.find({
        _id: convId,
        members: { $in: [userId] }
    })
}


/*-----------------------------------------------------------*/
/*                   MESSAGES DATABASE QUERY
/*-----------------------------------------------------------*/

//Funzione che prende tutti i messaggi di una chat => Usata quando si apre una chat
export async function getAllMessagesByConvId(conversationId) {
    return await Message.find({ conversationId: conversationId }).populate("sender", "username").populate("readBy", "username").lean()
}

export async function getMsgSender(msgId) {
    const msg = await Message.findById(msgId)

    return msg.sender.toString()
}

export async function getConvIdByMsgId(msgId) {
    const msg = await Message.findById(msgId)

    return msg.conversationId.toString()
}

export async function getAllReadBy(msgId) {
    const msg = await Message.findById(msgId).populate("readBy", "username").lean()

    return msg
}

//Funzione per creare un messaggio => usato quando un utente invia un msg
export async function createMessage(convId, userId, text) {
    const newMsg = await Message.create({
        conversationId: convId,
        sender: userId,
        text: text
    })

    return newMsg._id.toString()
}

/*
Funzione per aggiunge il readBy ad uno specifico messaggio
*/
export async function updateReadByMessage(messageId, userId) {
    await Message.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: userId }
    })
}

/*
Funzione che aggiunge un utente al readBy di tutti i messaggi che non ce l'hanno.
Usato quando un utente entra in una chat => segna visualizzati tutti i messaggi di quella chat

Si potrebbe migliorare limitando la ricerca comparando la data di quando è stato creato il msg con quella di ultima visita dell'utente

$ne => not equal
$lte => less than equal
*/
export async function updateAllReadBy(convId, userId) {
    await Message.updateMany(
        {
            conversationId: convId,
            readBy: { $ne: userId }
        },
        {
            $addToSet: { readBy: userId }
        }
    );
}

export async function deleteMessageById(msgId) {
    await Message.findByIdAndDelete(msgId)
}
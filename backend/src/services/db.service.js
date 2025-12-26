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
    return User.findOne({ username: username }).populate("friends", "username nome cognome email")
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

//Eliminazione profilo utente
export async function deleteUserById(userId) {
    await User.findByIdAndDelete(userId)
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

export async function deleteConversation(convId) {
    await Conversation.findByIdAndDelete(convId)
}
/**
 * Query per prendere l'id del creatore di una chat
 * usato per l'eliminazione di una chat => una chat può essere eliminata solo dal suo creatore
 */
export async function getConversationCreatorId(convId) {
    const user = await Conversation.findById(convId).lean()
    const userId = user.createdBy

    return userId
}

/**
 * $addToSet => aggiungi senza duplicati
 * $each     => prende l’array e aggiunge ogni elemento singolarmente  => Controllare come si comporta con un singolo elem
 */

export async function addChatMember(convId, newMemberIdArray) {
    const newMemberCasted = newMemberIdArray.isArray() ? newMemberIdArray : [newMemberIdArray]
    await Conversation.findByIdAndUpdate(convId, {
        $addToSet: { members: { $each: newMemberCasted } }
    })
}

export async function removeChatMember(convId, memberId) {
    await Conversation.findByIdAndUpdate(convId, {
        $pull: { members: memberId }
    })
}

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


/*-----------------------------------------------------------*/
/*                   MESSAGES DATABASE QUERY
/*-----------------------------------------------------------*/

//Funzione che prende tutti i messaggi di una chat => Usata quando si apre una chat
export async function getAllMessagesByConvId(conversationId) {
    return await Message.find({ conversationId: conversationId }).populate("sender", "username").populate("readBy", "username").lean()
}

//Funzione per creare un messaggio => usato quando un utente invia un msg
export async function createMessage(convId, userId, text) {
    await Message.create({
        conversationId: convId,
        sender: userId,
        text: text
    })
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
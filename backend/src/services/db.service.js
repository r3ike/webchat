import {User} from "../models/User.js"
import {Conversation} from "../models/Conversation.js"
import {Message} from "../models/Message.js"

/*-----------------------------------------------------------*/
/*                  USERS DATABASE QUERY
/*-----------------------------------------------------------*/

//Get profilo utente attraverso id
export async function getUserById(id) {
    return User.findById(id)
}

//Get profilo utente attraverso username
export async function getUserByUsername(username) {
    return User.findOne({username: username})
}

//Get profilo utente attraverso email
export async function getUserByEmail(email) {
    return User.findOne({email: email})
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
export async function createConversation(userId, name, type) {
    await Conversation.create({
        name:name,
        type:type,
        createdBy:userId,
        members:[userId]
    })
}

/*
$addToSet => aggiungi senza duplicati
*/
export async function addChatMember(convId,newMemberId) {
    await Conversation.findByIdAndUpdate(convId, {
        $addToSet: { members: newMemberId }
    })
}

export async function removeChatMember(convId,memberId) {
    await Conversation.findByIdAndUpdate(convId, {
        $pull: { members: memberId }
    })
}

//Funzione che prende tutte le chat SENZA massaggi di un utente => usato per popolare la barra laterale del frontend
export async function getAllChatByUserId(userId) {
    return await Conversation.find({members: userId}).populate("createdBy","members")
}


/*-----------------------------------------------------------*/
/*                   MESSAGES DATABASE QUERY
/*-----------------------------------------------------------*/

//Funzione che prende tutti i messaggi di una chat => Usata quando si apre una chat
export async function getAllMessagesByConvId(conversationId) {
    return await Message.find({conversationId:conversationId}).populate("conversationId","sender","readBy")
}
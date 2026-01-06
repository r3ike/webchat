import { deleteUserById, updateUserById, isInPendingInvitesList, sendFriendInvite, acceptFriendInvite, declineFriendInvite, removeFriend } from "../services/db.service.js";

/**
 * --------------------------------------------------------------------------------
 * ------------------------------- USER CONTROLLERS -------------------------------
 * --------------------------------------------------------------------------------
 */

/**
 * Delete user profile
 * 
 * ToDo:
 *  - eliminazionoe concatenata di tutte le le chat/ messaggi di quell'utente
 *  - capire come gestire i gruppi => se elimino cambia creator? o elimino anche il gruppo?
 */
export async function deleteUserProfileController(req,res) {
    const userId = req.user._id

    try {
        await deleteUserById(userId)

        return res.status(200).json({message:"Profilo eliminato con successo!"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Errore nella eliminazione del profilo!"})
    }
}
//UPDATE ACCOUNT
export async function updateUserProfileController(req,res) {
    const userId = req.user._id
}

/**
 * --------------------------------------------------------------------------------------
 * -------------------------------FRIENDS CONTROLLERS------------------------------------
 * --------------------------------------------------------------------------------------
 */

//Send friend invite
export async function sendFriendInviteController(req,res) {
    const userId = req.user._id

    const destUserId = req.body.destUserId

    try {
        await sendFriendInvite(userId, destUserId)

        return res.status(200).json({message:"Richiesta di amicizia inviata con successo!"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Errore nell'invio della richiesta di amicizia!"})
        
    }
}

/**
 *  Accept friend invite:
 *      - Remove from the pending invites in the DB
 *      - Add to the friends list on both side
 *  
 *  Attenzione : capire come tenere traccia anche delle richieste di amicizia inviate da un utente e non di quelle ricevute
 *  Probabilmente si può guardare in quali liste degli altri utenti compare l'id dell'utente in questione
 */
export async function acceptFriendInviteController(req,res) {
    const userId = req.user._id

    const inviteSenderId = req.body.inviteSenderId //Id dell'utente che ha inviato la richiesta di amicizia

    try {
        const userInfo = await isInPendingInvitesList(userId, inviteSenderId)
        
        if (userInfo.length === 0) {
            return res.status(400).json({message: "Richiesta non presente!"})
        }

        await acceptFriendInvite(userId, inviteSenderId)

        return res.status(200).json({message:"Richiesta di amicizia accettata con successo!"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Errore nell'accettazione della richiesta di amicizia!"})
    }
}

/**
 *  Decline friend invite:
 *      - Remove from the pending invites in the DB
 */
export async function declineFriendInviteController(req,res) {
    const userId = req.user._id

    const inviteSenderId = req.body.inviteSenderId //Id dell'utente che ha inviato la richiesta di amicizia

    try {
        const userInfo = await isInPendingInvitesList(userId, inviteSenderId)
        
        if (userInfo.length === 0) {
            return res.status(400).json({message: "Richiesta non presente!"})
        }

        await declineFriendInvite(userId, inviteSenderId)

        return res.status(200).json({message:"Richiesta declinata con successo!"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Errore nella declinazione della richiesta di amicizia!"})
    }
}

/**
 * Remove friend:
 *     - Remove from the friends list on both side
 */
export async function removeFriendController(req,res) {
    const userId = req.user._id

    const friendId = req.body.friendId
    try {
        await removeFriend(userId, friendId)

        return res.status(200).json({message:"Amicizia eliminata con successo!"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Errore interno durante la rimozione dell'amicizia!"})
    }
}
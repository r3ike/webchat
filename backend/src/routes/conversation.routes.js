import {Router} from "express"

import {getAllConversationsController, getConversationsByIdController, createConversationController, deleteConversationController, addChatMemberController, removeChatMemberController} from "../controllers/conversation.controller.js"
import {authenticateUser} from "../middlewares/auth.middlewares.js"

const router = Router()

router.get('/', authenticateUser, getAllConversationsController)

router.get('/:convId', authenticateUser, getConversationsByIdController)

router.post('/', authenticateUser, createConversationController)

router.delete('/', authenticateUser, deleteConversationController)

/**
 * Routes per i membri
 */
router.post('/member', authenticateUser, addChatMemberController)

router.delete('/member', authenticateUser, removeChatMemberController)

export default router
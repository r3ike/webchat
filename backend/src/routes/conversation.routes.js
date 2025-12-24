import {Router} from "express"

import {getAllConversationsController, createConversationController} from "../controllers/conversation.controller.js"
import {authenticateUser} from "../middlewares/auth.middlewares.js"

const router = Router()

router.get('/', authenticateUser, getAllConversationsController)

router.post('/', authenticateUser, createConversationController)

export default router
import {Router} from "express"

import { getAllMsgController, getAllReadByController, deleteMsgController } from "../controllers/message.controller.js";
import { authenticateUser } from "../middlewares/auth.middlewares.js";

const router = Router()

router.get('/', authenticateUser, getAllMsgController)

router.get('/readby', authenticateUser, getAllReadByController)

router.delete('/',authenticateUser, deleteMsgController)

export default router
import {Router} from "express"

import { getAllMsgController, getAllReadByController, deleteMsgController } from "../controllers/message.controller.js";
import { authenticateUser } from "../middlewares/auth.middlewares.js";

const router = Router()

router.get('/readby', authenticateUser, getAllReadByController)

router.get('/:convId', authenticateUser, getAllMsgController)

router.delete('/',authenticateUser, deleteMsgController)

export default router
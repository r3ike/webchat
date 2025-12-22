import { Router } from "express";

import {registerController, loginController, checkAuthController, logoutController} from "../controllers/auth.controller.js"
import {authenticateUser} from "../middlewares/auth.middlewares.js"

const router = Router()

router.post('/register', registerController)

router.post('/login', loginController)

router.post('/check',authenticateUser, checkAuthController)

router.post('/logout', authenticateUser, logoutController)

export default router
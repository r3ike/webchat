import { Router } from "express";

import {authenticateUser} from "../middlewares/auth.middlewares.js"

import {getAllUserController, getUserByIdController, deleteUserProfileController, updateUserProfileController, sendFriendInviteController, declineFriendInviteController, acceptFriendInviteController, removeFriendController } from "../controllers/user.controller.js";

const router = Router()

router.get('/',authenticateUser, getAllUserController)

// User profile management routes

// router.delete('/', authenticateUser, deleteUserProfileController)

// router.put('/', authenticateUser, updateUserProfileController)

// Friends management routes

router.post('/friends', authenticateUser, sendFriendInviteController)

router.delete('/friends', authenticateUser, removeFriendController)

router.post('/friends/accept', authenticateUser, acceptFriendInviteController)

router.post('/friends/decline', authenticateUser, declineFriendInviteController)

export default router
import express from 'express';
import { loginUser, registerUser, getUserInfo, logoutUser, inviteMember } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.post("/invite", authenticateToken, inviteMember);
router.get("/me", authenticateToken, getUserInfo);

export default router;
import express from "express";
import { protectRoute } from "../middlewares/authMiddlewares.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  changeUserPassword
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.put("/change-password", protectRoute, changeUserPassword);

export default router
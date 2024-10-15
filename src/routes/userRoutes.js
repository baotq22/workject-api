import express from "express";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewares.js";
import {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  loginUser,
  logoutUser,
  markNotificationAsRead,
  registerUser,
  updateUserProfile
} from "../controllers/userController.js";
import { validators } from '../middlewares/validators.js';
import { body } from 'express-validator';


const router = express.Router();

router.post(
  "/register",
  validators.validate([
    body("name", "Invalid Name").exists().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty()
  ]),
  registerUser
);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/get-team", protectRoute, isAdminRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);

router.put("/profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationAsRead);
router.put("/change-password", protectRoute, changeUserPassword);

// admin role
router
  .route("/:id")
  .put(protectRoute, isAdminRoute, activateUserProfile)
  .delete(protectRoute, isAdminRoute, deleteUserProfile);

export default router
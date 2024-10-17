import express from "express";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewares.js";
import {
  activateUserProfile,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  markNotificationAsRead,
  updateUserProfile
} from "../controllers/userController.js";

const router = express.Router();

router.get("/get-team", protectRoute, isAdminRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);

router.put("/profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationAsRead);

// admin role
router
  .route("/:id")
  .put(protectRoute, isAdminRoute, activateUserProfile)
  .delete(protectRoute, isAdminRoute, deleteUserProfile);

export default router
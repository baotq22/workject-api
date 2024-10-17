import express from "express";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";
import authRoutes from "./authRoutes.js";

export const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/task", taskRoutes);
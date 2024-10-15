import express from "express";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";

export const router = express.Router();

router.use("/user", userRoutes);
router.use("/task", taskRoutes);
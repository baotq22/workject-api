import express from 'express';
import { getAllProject, addProject, updateProject } from '../controllers/projectController.js';

const router = express.Router();

router.get("/get-all", getAllProject);
router.post("/add", addProject);
router.patch("/update/:id", updateProject);

export default router;
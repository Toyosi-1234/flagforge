import { Router } from "express";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { createProject, listProjects } from "../controllers/projectController.js";

const router = Router();
router.use(authenticateAdmin);
router.get("/", listProjects);
router.post("/", createProject);
export default router;

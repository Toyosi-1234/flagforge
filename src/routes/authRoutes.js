import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateAdmin, me);
export default router;

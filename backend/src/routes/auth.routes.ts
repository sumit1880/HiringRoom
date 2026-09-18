import { Router } from "express";
import { googleAuth, devLogin } from "../controllers/auth.controller.js";

const router = Router();

router.post("/google", googleAuth);
router.post("/dev-login", devLogin);

export default router;
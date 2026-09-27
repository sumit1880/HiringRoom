import { Router } from "express";
import {
  googleAuth,
  register,
  login,
  logout,
  devLogin,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.post("/dev-login", devLogin);

export default router;
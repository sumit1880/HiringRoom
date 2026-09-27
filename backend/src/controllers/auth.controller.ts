import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import {
  googleAuthSchema,
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";
import {
  authenticateWithGoogle,
  registerWithEmailPassword,
  loginWithEmailPassword,
  devLogin as doDevLogin,
} from "../services/auth.service.js";

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const body = googleAuthSchema.parse(req.body);

  const result = await authenticateWithGoogle(body);

  res.status(200).json({
    success: true,
    message: "Signed in with Google",
    data: result,
  });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  const result = await registerWithEmailPassword(body);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const result = await loginWithEmailPassword(body);

  res.status(200).json({
    success: true,
    message: "Signed in successfully",
    data: result,
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const devLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body || {};
  const result = await doDevLogin(email, name);

  res.status(200).json({
    success: true,
    message: "Signed in with Dev Login",
    data: result,
  });
});
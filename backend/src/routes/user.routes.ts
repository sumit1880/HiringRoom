import { Router } from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/prisma.js";

const router = Router();

router.get("/me", protect, (req, res) => {
  const user = req.user!;

  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      profileImage: user.profileImage,
      authProvider: user.authProvider,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// Permanently deletes the authenticated user's account. Their resumes and
// interview sessions (and everything under those — questions, evaluations,
// feedback, messages) cascade-delete automatically via the existing
// onDelete: Cascade relations in schema.prisma.
router.delete(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    await prisma.user.delete({
      where: { id: req.user!.id },
    });

    res.json({
      success: true,
      message: "Account deleted",
    });
  })
);

export default router;
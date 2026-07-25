import { OAuth2Client } from "google-auth-library";

import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/jwt.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

interface GoogleAuthInput {
  idToken: string;
}

export async function authenticateWithGoogle(data: GoogleAuthInput) {
  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken: data.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch {
    throw new ApiError(401, "Invalid Google token");
  }

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new ApiError(401, "Invalid Google token");
  }

  const { sub: googleId, email, name, picture, email_verified } = payload;

  if (!email_verified) {
    throw new ApiError(401, "Google email is not verified");
  }

  // Look up by googleId first, then fall back to email so an existing
  // account (created before this migration) gets linked instead of
  // duplicated — this preserves its existing resumes/interview sessions.
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          profileImage: picture ?? user.profileImage,
          authProvider: "GOOGLE",
        },
      });
    }
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name ?? email.split("@")[0],
        email,
        googleId,
        profileImage: picture,
        authProvider: "GOOGLE",
      },
    });
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
  };
}
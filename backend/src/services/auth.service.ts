import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/jwt.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

interface GoogleAuthInput {
  idToken: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerWithEmailPassword(data: RegisterInput) {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "LOCAL",
    },
  });

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

export async function loginWithEmailPassword(data: LoginInput) {
  const normalizedEmail = data.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.password) {
    throw new ApiError(
      400,
      "This account was registered using Google. Please sign in with Google."
    );
  }

  const isMatch = await bcrypt.compare(data.password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
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

export async function devLogin(email = "alex@example.com", name = "Alex Rivera") {
  if (env.NODE_ENV === "production") {
    throw new ApiError(403, "Dev login is not available in production");
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        authProvider: "LOCAL",
      },
    });
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
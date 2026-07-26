import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT || 5000),

  DATABASE_URL: requireEnv("DATABASE_URL"),

  JWT_SECRET: requireEnv("JWT_SECRET"),

  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),

  GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),

  OPENROUTER_API_KEY: requireEnv("OPENROUTER_API_KEY"),

  GROQ_API_KEY: requireEnv("GROQ_API_KEY"),
};
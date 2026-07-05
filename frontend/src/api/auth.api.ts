import api from "./axios";
import type { AuthData } from "../utils/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function login(
  data: LoginRequest
): Promise<AuthData> {
  const response = await api.post("/auth/login", data);

  return response.data.data;
}

export async function register(
  data: RegisterRequest
) {
  const response = await api.post("/auth/register", data);

  return response.data.data;
}
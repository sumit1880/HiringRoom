import api from "./axios";
import type { User } from "../types/dashboard";

export async function getCurrentUser(): Promise<User> {
  const response = await api.get("/users/me");

  return response.data.data;
}
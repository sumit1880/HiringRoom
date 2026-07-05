const AUTH_KEY = "auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthData {
  token: string;
  user: AuthUser;
}

export function saveAuth(data: AuthData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function getAuth(): AuthData | null {
  const auth = localStorage.getItem(AUTH_KEY);

  if (!auth) return null;

  return JSON.parse(auth);
}

export function getToken(): string | null {
  return getAuth()?.token ?? null;
}

export function getUser(): AuthUser | null {
  return getAuth()?.user ?? null;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}
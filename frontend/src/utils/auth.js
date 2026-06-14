import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";

export function getStoredUser() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function storeAuthSession({ token, user }) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthHeaders() {
  const token = getAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
      : {};
}

export async function fetchCurrentUser() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const { data } = await axios.get(`${API_BASE_URL}/api/auth/current-user`, {
    headers: getAuthHeaders(),
  });

  if (data?.user) {
    storeAuthSession({ user: data.user });
    return data.user;
  }

  return null;
}

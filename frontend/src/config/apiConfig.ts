const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = envApiBaseUrl
  ? envApiBaseUrl
  : import.meta.env.DEV
    ? "http://localhost:5000"
    : "";

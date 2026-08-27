import axios from "axios";

let authTokenGetter: (() => string | null) | null = null;

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    `${window.location.protocol}//${window.location.hostname}:5050/api`
});

export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter;
}

api.interceptors.request.use((config) => {
  const token = authTokenGetter?.();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

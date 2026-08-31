import axios from "axios";

let authTokenGetter: (() => string | null) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    `${window.location.protocol}//${window.location.hostname}:5050/api`
});

export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter;
}

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

api.interceptors.request.use((config) => {
  const token = authTokenGetter?.();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

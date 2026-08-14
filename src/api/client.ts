import axios from "axios";

const TOKEN_KEY = "ba_token";
let authToken = typeof sessionStorage === "undefined" ? null : sessionStorage.getItem(TOKEN_KEY);

export const apiClient = axios.create({
  baseURL: "/api",
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = String(error.config?.url || "").endsWith("/login");
    if (error.response?.status === 401 && !isLogin) {
      clearAuthToken();
      if (window.location.pathname !== "/") window.location.replace("/");
    }
    return Promise.reject(error);
  },
);

export function setAuthToken(token: string) {
  authToken = token;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  authToken = null;
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
  return authToken;
}

import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://bridalarcade.lk").replace(/\/$/, "");

export interface LoginResponse {
  token: string;
  user_id: number | string;
  firstname?: string;
}

export async function loginPartner(email: string, password: string): Promise<LoginResponse> {
  const response = await axios.get(`${API_BASE_URL}/wp-json/bridal/v2/login`, {
    params: { username_or_email: email, password },
  });
  const data = response.data as Partial<LoginResponse>;
  if (!data.token || !data.user_id) {
    throw new Error("The server returned an incomplete login response.");
  }
  return data as LoginResponse;
}

export async function fetchDashboard(email: string) {
  if (!email) throw new Error("Your session is missing an email address. Please sign in again.");
  const response = await axios.get(`${API_BASE_URL}/wp-json/bridal/v2/dashboard`, { params: { email } });
  return response.data;
}

export async function fetchProducts(email: string) {
  if (!email) throw new Error("Your session is missing an email address. Please sign in again.");
  const response = await axios.get(`${API_BASE_URL}/wp-json/bridal/v1/productlist`, { params: { email } });
  if (!Array.isArray(response.data)) throw new Error("The server returned an invalid product list.");
  return response.data;
}

export async function fetchOrders(email: string) {
  if (!email) throw new Error("Your session is missing an email address. Please sign in again.");
  const response = await axios.get(`${API_BASE_URL}/wp-json/bridal/v1/orderlist`, { params: { email } });
  if (!Array.isArray(response.data)) throw new Error("The server returned an invalid order list.");
  return response.data;
}

export function readSessionCache<T>(key: string): T | null {
  const stored = sessionStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as T;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return error instanceof Error && error.message ? error.message : fallback;
  if (!error.response) return "We couldn't connect to Bridal Arcade. Check your internet connection and try again.";
  if (error.response.status === 401 || error.response.status === 403) return "Your session is not authorized. Please sign in again.";
  if (error.response.status >= 500) return "Bridal Arcade is temporarily unavailable. Please try again in a moment.";
  const data = error.response.data as { message?: unknown } | undefined;
  if (typeof data?.message === "string") {
    const clean = data.message.replace(/<[^>]*>/g, "").trim();
    if (clean) return clean;
  }
  return fallback;
}

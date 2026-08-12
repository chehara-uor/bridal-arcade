import axios from "axios";
import { clearMockVendorUser, getMockVendorUser, getStoredAccountType, setStoredAccountType, type AccountType } from "../auth/account";

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  account_type?: AccountType;
}

const client = axios.create({ baseURL: "/api", withCredentials: true, headers: { Accept: "application/json" } });

export async function loginPartner(usernameOrEmail: string, password: string): Promise<PortalUser> {
  const response = await client.post("/login", { username_or_email: usernameOrEmail, password });
  if (!response.data?.user?.id || !response.data?.user?.email) throw new Error("The server returned an incomplete login response.");
  return response.data.user as PortalUser;
}

export async function getSession(): Promise<PortalUser> {
  const mockUser = getMockVendorUser();
  if (mockUser) return mockUser;
  const response = await client.get("/session");
  return response.data.user as PortalUser;
}

export async function logoutPartner(): Promise<void> {
  try { await client.post("/logout"); } finally {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("accountType");
    localStorage.removeItem("vendorUserID");
    localStorage.removeItem("userID");
    sessionStorage.clear();
  }
}

export function storeUser(user: PortalUser, accountType?: AccountType) {
  sessionStorage.setItem("userID", user.id);
  sessionStorage.setItem("userName", user.name || "Partner");
  sessionStorage.setItem("userEmail", user.email);
  setStoredAccountType(accountType || user.account_type || getStoredAccountType());
  localStorage.setItem("isAuthenticated", "true");
}

export function prepareForRealLogin() {
  clearMockVendorUser();
  sessionStorage.clear();
  localStorage.removeItem("accountType");
  localStorage.removeItem("vendorUserID");
  localStorage.removeItem("userID");
}

export async function fetchDashboard() {
  return (await client.get("/dashboard")).data;
}

export async function fetchRecentActivity() {
  return (await client.get("/recent-activity")).data;
}

export async function fetchProducts(_email?: string) {
  const response = await client.get("/products");
  if (!Array.isArray(response.data)) throw new Error("The server returned an invalid product list.");
  return response.data;
}

export async function fetchOrders(email: string) {
  if (!email) throw new Error("Your session is missing an email address. Please sign in again.");
  const response = await client.get("/orders");
  if (!Array.isArray(response.data)) throw new Error("The server returned an invalid order list.");
  return response.data;
}

export function readSessionCache<T>(key: string): T | null {
  const stored = sessionStorage.getItem(key);
  if (!stored) return null;
  try { return JSON.parse(stored) as T; }
  catch { sessionStorage.removeItem(key); return null; }
}

export function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return error instanceof Error && error.message ? error.message : fallback;
  if (!error.response) return "We couldn't connect to Bridal Arcade. Check your internet connection and try again.";
  const data = error.response.data as { message?: unknown } | undefined;
  const serverMessage = typeof data?.message === "string" ? data.message.replace(/<[^>]*>/g, "").trim() : "";
  if (serverMessage) return serverMessage;
  if (error.response.status === 401) return "Your session has expired. Please sign in again.";
  if (error.response.status === 403) return "You don't have permission to access this part of Bridal Arcade.";
  if (error.response.status >= 500) return "Bridal Arcade is temporarily unavailable. Please try again in a moment.";
  return fallback;
}

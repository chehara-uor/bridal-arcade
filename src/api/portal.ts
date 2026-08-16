import axios from "axios";
import { clearMockVendorUser, getStoredAccountType, setStoredAccountType, type AccountType } from "../auth/account";
import { apiClient as client, clearAuthToken, getAuthToken, setAuthToken } from "./client";
import { normalizePricingPlan, type PricingPlan } from "../auth/pricingPlan";

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  role?: string;
  account_type?: AccountType;
  profile_status?: "active" | "inactive";
  pricing_plan?: PricingPlan;
}

export async function loginPartner(usernameOrEmail: string, password: string): Promise<PortalUser> {
  const response = await client.post("/auth/login", { username_or_email: usernameOrEmail, password });
  if (!response.data?.user?.id || !response.data?.user?.email) throw new Error("The server returned an incomplete login response.");
  if (!response.data?.token) throw new Error("The server returned an incomplete authentication response.");
  setAuthToken(String(response.data.token));
  return response.data.user as PortalUser;
}

export async function getSession(): Promise<PortalUser> {
  if (!getAuthToken()) throw new Error("Not logged in.");
  try {
    const response = await client.get("/auth/session");
    if (!response.data?.token || !response.data?.user) throw new Error("The server returned an incomplete session response.");
    setAuthToken(String(response.data.token));
    return response.data.user as PortalUser;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) clearAuthToken();
    throw error;
  }
}

export async function logoutPartner(): Promise<void> {
  try {
    clearAuthToken();
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("accountType");
    localStorage.removeItem("vendorUserID");
    localStorage.removeItem("userID");
    sessionStorage.clear();
  } finally { clearAuthToken(); }
}

export function hasAuthToken(): boolean { return Boolean(getAuthToken()); }

export function storeUser(user: PortalUser, accountType?: AccountType) {
  sessionStorage.setItem("userID", user.id);
  sessionStorage.setItem("userName", user.name || "Partner");
  sessionStorage.setItem("userEmail", user.email);
  sessionStorage.setItem("userRoles", JSON.stringify(user.roles || []));
  sessionStorage.setItem("userRole", user.role || user.roles?.[0] || "");
  sessionStorage.setItem("profileStatus", user.profile_status || "active");
  sessionStorage.setItem("pricingPlan", normalizePricingPlan(user.pricing_plan));
  setStoredAccountType(accountType || user.account_type || getStoredAccountType());
  localStorage.setItem("isAuthenticated", "true");
}

export function prepareForRealLogin() {
  clearAuthToken();
  clearMockVendorUser();
  sessionStorage.clear();
  localStorage.removeItem("accountType");
  localStorage.removeItem("vendorUserID");
  localStorage.removeItem("userID");
}

export async function fetchDashboard() {
  return (await client.get("/portal/dashboard", { params: { email: sessionStorage.getItem("userEmail") || "" } })).data;
}

export async function fetchRecentActivity() {
  return (await client.get("/portal/recent-activity", { params: { email: sessionStorage.getItem("userEmail") || "" } })).data;
}

export async function fetchProducts(email?: string) {
  const response = await client.get("/portal/products", { params: { email: email || sessionStorage.getItem("userEmail") || "" } });
  if (!Array.isArray(response.data)) throw new Error("The server returned an invalid product list.");
  return response.data;
}

export async function fetchOrders(email: string) {
  if (!email) throw new Error("Your session is missing an email address. Please sign in again.");
  const response = await client.get("/portal/orders", { params: { email } });
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

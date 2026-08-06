import axios from "axios";

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

const client = axios.create({ baseURL: "/api", withCredentials: true, headers: { Accept: "application/json" } });

export async function loginPartner(usernameOrEmail: string, password: string): Promise<PortalUser> {
  const response = await client.post("/login", { username_or_email: usernameOrEmail, password });
  if (!response.data?.user?.id || !response.data?.user?.email) throw new Error("The server returned an incomplete login response.");
  return response.data.user as PortalUser;
}

export async function getSession(): Promise<PortalUser> {
  const response = await client.get("/session");
  return response.data.user as PortalUser;
}

export async function logoutPartner(): Promise<void> {
  try { await client.post("/logout"); } finally {
    localStorage.removeItem("isAuthenticated");
    sessionStorage.clear();
  }
}

export function storeUser(user: PortalUser) {
  sessionStorage.setItem("userID", user.id);
  sessionStorage.setItem("userName", user.name || "Partner");
  sessionStorage.setItem("userEmail", user.email);
  localStorage.setItem("isAuthenticated", "true");
}

export async function fetchDashboard() {
  return (await client.get("/dashboard")).data;
}

export async function fetchRecentActivity() {
  return (await client.get("/recent-activity")).data;
}

// These remain compatibility calls until their corresponding server routes are enabled.
export async function fetchProducts(email: string) {
  if (!email) throw new Error("Your session is missing an email address. Please sign in again.");
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
  if (error.response.status === 401 || error.response.status === 403) return "Your session is not authorized. Please sign in again.";
  if (error.response.status >= 500) return "Bridal Arcade is temporarily unavailable. Please try again in a moment.";
  const data = error.response.data as { message?: unknown } | undefined;
  return typeof data?.message === "string" ? data.message.replace(/<[^>]*>/g, "").trim() || fallback : fallback;
}

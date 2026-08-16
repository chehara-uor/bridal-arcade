/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PortalUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  role?: string;
  account_type?: "individual" | "business";
  profile_status?: "active" | "inactive";
  pricing_plan?: "free" | "basic" | "standard";
}

export function bearerAuthorization(request: { headers: Record<string, string | string[] | undefined> }): string | null {
  const value = request.headers.authorization;
  const authorization = Array.isArray(value) ? value[0] : value;
  return typeof authorization === "string" && /^Bearer\s+\S+$/i.test(authorization) ? authorization : null;
}

export function requireBearer(request: any, response: any): string | null {
  const authorization = bearerAuthorization(request);
  if (!authorization) sendJson(response, 401, { message: "You are not logged in." });
  return authorization;
}

export function wordpressUrl(): string {
  const url = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");
  if (!url) throw new Error("WORDPRESS_API_URL is not configured.");
  return url;
}

export function sendJson(response: any, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

export async function readJson(request: any): Promise<Record<string, unknown>> {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function wordpressJson(path: string, init: RequestInit = {}) {
  const response = await fetch(`${wordpressUrl()}${path}`, { ...init, cache: "no-store", headers: { Accept: "application/json", "Cache-Control": "no-store", ...init.headers } });
  const data = await response.json().catch(() => ({ message: "WordPress returned an invalid response." }));
  return { response, data };
}

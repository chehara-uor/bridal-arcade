/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHmac, timingSafeEqual } from "node:crypto";

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface SessionPayload extends PortalUser { exp: number }

const COOKIE_NAME = "bridal_portal_session";
const SESSION_SECONDS = 60 * 60 * 8;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return value;
}

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function signature(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSession(user: PortalUser): string {
  const payload = encode(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }));
  return `${payload}.${signature(payload)}`;
}

export function readSession(request: { headers: Record<string, string | string[] | undefined> }): SessionPayload | null {
  const rawCookie = Array.isArray(request.headers.cookie) ? request.headers.cookie.join(";") : request.headers.cookie || "";
  const token = rawCookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return null;
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied) return null;
  const expected = signature(payload);
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    return session.exp > Math.floor(Date.now() / 1000) ? session : null;
  } catch { return null; }
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL) ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${SESSION_SECONDS}`;
}

export function expiredSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL) ? "; Secure" : "";
  return `${COOKIE_NAME}=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`;
}

export function wordpressConfig() {
  const url = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");
  const username = process.env.WORDPRESS_API_USERNAME;
  const password = process.env.WORDPRESS_API_PASSWORD;
  if (!url || !username || !password) throw new Error("WordPress server credentials are not configured.");
  return { url, authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}` };
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
  const config = wordpressConfig();
  const response = await fetch(`${config.url}${path}`, { ...init, cache: "no-store", headers: { Accept: "application/json", "Cache-Control": "no-store", ...init.headers } });
  const data = await response.json().catch(() => ({ message: "WordPress returned an invalid response." }));
  return { response, data };
}

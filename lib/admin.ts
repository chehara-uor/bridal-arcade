/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireBearer, sendJson } from "./session.js";

export function requireAdministrator(request: any, response: any): { headers: Record<string, string> } | null {
  const authorization = requireBearer(request, response);
  return authorization ? { headers: { Authorization: authorization } } : null;
}

export function relayError(response: any, status: number, data: any, fallback: string) {
  const safeStatus = [400, 401, 403, 404].includes(status) ? status : 502;
  return sendJson(response, safeStatus, { message: data?.message || fallback });
}

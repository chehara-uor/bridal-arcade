/* eslint-disable @typescript-eslint/no-explicit-any */
import { expiredSessionCookie, sendJson } from "./_session.js";
export default function handler(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  response.setHeader("Set-Cookie", expiredSessionCookie());
  return sendJson(response, 200, { ok: true });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendJson } from "./_session.js";
export default function handler(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  return sendJson(response, 200, { ok: true });
}

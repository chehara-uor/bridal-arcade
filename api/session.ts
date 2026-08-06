/* eslint-disable @typescript-eslint/no-explicit-any */
import { readSession, sendJson } from "./_session.js";
export default function handler(request: any, response: any) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  const session = readSession(request);
  if (!session) return sendJson(response, 401, { message: "Your session has expired." });
  const { exp: _exp, ...user } = session;
  return sendJson(response, 200, { user });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireBearer, sendJson, wordpressJson } from "./_session.js";
export default async function handler(request: any, response: any) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  const authorization = requireBearer(request, response);
  if (!authorization) return;
  try {
    const email = new URL(request.url || "/", "http://localhost").searchParams.get("email") || "";
    const result = await wordpressJson(`/wp-json/bridal/v2/dashboard?email=${encodeURIComponent(email)}`, { headers: { Authorization: authorization } });
    if (!result.response.ok) return sendJson(response, result.response.status, { message: "Unable to load your dashboard." });
    return sendJson(response, 200, result.data);
  } catch { return sendJson(response, 502, { message: "Unable to connect to Bridal Arcade." }); }
}

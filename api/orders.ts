/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireBearer, sendJson, wordpressJson } from "./_session.js";
export default async function handler(request: any, response: any) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  const authorization = requireBearer(request, response);
  if (!authorization) return;
  try {
    const email = new URL(request.url || "/", "http://localhost").searchParams.get("email") || "";
    const result = await wordpressJson(`/wp-json/bridal/v1/orderlist?email=${encodeURIComponent(email)}`, { headers: { Authorization: authorization } });
    return sendJson(response, result.response.ok ? 200 : result.response.status, result.data);
  } catch { return sendJson(response, 502, { message: "Unable to load orders." }); }
}

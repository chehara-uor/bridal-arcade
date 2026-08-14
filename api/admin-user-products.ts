/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdministrator, relayError } from "./_admin.js";
import { sendJson, wordpressJson } from "./_session.js";

export default async function handler(request: any, response: any) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  const auth = requireAdministrator(request, response);
  if (!auth) return;
  const incoming = new URL(request.url || "/", "http://localhost").searchParams;
  const email = incoming.get("email")?.trim() || "";
  if (!email) return sendJson(response, 400, { message: "A user email is required." });
  try {
    const query = new URLSearchParams({ email });
    for (const key of ["requester_email", "requester_type"]) if (incoming.get(key)) query.set(key, incoming.get(key)!);
    const result = await wordpressJson(`/wp-json/bridal/v2/productlist?${query}`, { headers: auth.headers });
    if (!result.response.ok) return relayError(response, result.response.status, result.data, "Unable to load this user's products.");
    const products = Array.isArray(result.data) ? result.data : result.data?.products ?? result.data?.data;
    if (!Array.isArray(products)) return sendJson(response, 502, { message: "WordPress returned an invalid product list." });
    return sendJson(response, 200, products);
  } catch {
    return sendJson(response, 502, { message: "Unable to load this user's products." });
  }
}

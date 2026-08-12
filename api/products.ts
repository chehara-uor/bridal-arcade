/* eslint-disable @typescript-eslint/no-explicit-any */
import { readSession, sendJson, wordpressConfig, wordpressJson } from "./_session.js";
export default async function handler(request: any, response: any) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  const session = readSession(request);
  if (!session) return sendJson(response, 401, { message: "Your session has expired." });
  try {
    const { authorization } = wordpressConfig();
    const query = new URLSearchParams({ email: session.email, page: "1", per_page: "50" });
    const result = await wordpressJson(`/wp-json/bridal/v2/productlist?${query.toString()}`, { headers: { Authorization: authorization } });
    if (!result.response.ok) return sendJson(response, result.response.status, { message: result.data?.message || "Unable to load products." });
    const products = Array.isArray(result.data) ? result.data : Array.isArray(result.data?.products) ? result.data.products : Array.isArray(result.data?.data) ? result.data.data : null;
    if (!products) return sendJson(response, 502, { message: "WordPress returned an invalid product list." });
    return sendJson(response, 200, products);
  } catch { return sendJson(response, 502, { message: "Unable to load products." }); }
}

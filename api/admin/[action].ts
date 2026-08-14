/* eslint-disable @typescript-eslint/no-explicit-any */
// Consolidated to stay under Vercel's Hobby-plan Serverless Function count:
// GET  /api/admin/users            (was api/admin-users.ts)
// POST /api/admin/user-status      (was api/admin-user-status.ts)
// GET  /api/admin/user-products    (was api/admin-user-products.ts)
// POST /api/admin/product-status   (was api/admin-product-status.ts)
import { requireAdministrator, relayError } from "../../lib/admin.js";
import { readJson, sendJson, wordpressJson } from "../../lib/session.js";

export default async function handler(request: any, response: any) {
  const action = new URL(request.url || "/", "http://localhost").pathname.split("/").pop();
  const auth = requireAdministrator(request, response);
  if (!auth) return;
  switch (action) {
    case "users": return users(request, response, auth);
    case "user-status": return userStatus(request, response, auth);
    case "user-products": return userProducts(request, response, auth);
    case "product-status": return productStatus(request, response, auth);
    default: return sendJson(response, 404, { message: "Not found." });
  }
}

async function users(request: any, response: any, auth: { headers: Record<string, string> }) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const incoming = new URL(request.url || "/", "http://localhost").searchParams;
    const query = new URLSearchParams();
    for (const key of ["requester_email", "requester_type", "search", "role", "status", "page", "per_page"]) {
      const value = incoming.get(key);
      if (value) query.set(key, value);
    }
    const result = await wordpressJson(`/wp-json/bridal/v2/admin/users?${query}`, { headers: auth.headers });
    if (!result.response.ok) return relayError(response, result.response.status, result.data, "Unable to load users.");
    return sendJson(response, 200, result.data);
  } catch {
    return sendJson(response, 502, { message: "Unable to load users." });
  }
}

async function userStatus(request: any, response: any, auth: { headers: Record<string, string> }) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const status = body.status === "active" || body.status === "inactive" ? body.status : "";
    const targetUserId = Number(body.target_user_id);
    const targetEmail = typeof body.target_email === "string" ? body.target_email.trim() : "";
    if (!status || (!Number.isInteger(targetUserId) && !targetEmail)) return sendJson(response, 400, { message: "A target user and valid status are required." });
    const payload: Record<string, unknown> = { requester_email: body.requester_email, requester_type: body.requester_type, status };
    if (Number.isInteger(targetUserId) && targetUserId > 0) payload.target_user_id = targetUserId;
    else payload.target_email = targetEmail;
    const result = await wordpressJson("/wp-json/bridal/v2/admin/user-status", {
      method: "POST",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!result.response.ok) return relayError(response, result.response.status, result.data, "Unable to update this user.");
    return sendJson(response, 200, result.data);
  } catch {
    return sendJson(response, 502, { message: "Unable to update this user." });
  }
}

async function userProducts(request: any, response: any, auth: { headers: Record<string, string> }) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
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

async function productStatus(request: any, response: any, auth: { headers: Record<string, string> }) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const productId = Number(body.product_id);
    const status = String(body.status || "");
    if (!Number.isInteger(productId) || productId <= 0 || !["publish", "draft", "trash"].includes(status)) return sendJson(response, 400, { message: "Invalid product update." });
    const result = await wordpressJson("/wp-json/bridal/v2/update-product-status", {
      method: "POST",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, status, requester_email: body.requester_email, requester_type: body.requester_type }),
    });
    if (!result.response.ok) return relayError(response, result.response.status, result.data, "Unable to update this product.");
    return sendJson(response, 200, result.data);
  } catch {
    return sendJson(response, 502, { message: "Unable to update this product." });
  }
}

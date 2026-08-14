/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdministrator, relayError } from "./_admin.js";
import { readJson, sendJson, wordpressJson } from "./_session.js";

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  const auth = requireAdministrator(request, response);
  if (!auth) return;
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

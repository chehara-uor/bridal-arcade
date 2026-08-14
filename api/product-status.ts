/* eslint-disable @typescript-eslint/no-explicit-any */
import { readJson, requireBearer, sendJson, wordpressJson } from "./_session.js";
export default async function handler(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  const authorization = requireBearer(request, response);
  if (!authorization) return;
  try {
    const body = await readJson(request);
    const productId = Number(body.product_id);
    const status = String(body.status || "");
    if (!Number.isInteger(productId) || productId <= 0 || !["publish", "draft"].includes(status)) return sendJson(response, 400, { message: "Invalid product update." });
    const result = await wordpressJson("/wp-json/bridal/v2/update-product-status", { method: "POST", headers: { Authorization: authorization, "Content-Type": "application/json" }, body: JSON.stringify({ product_id: productId, status }) });
    if (!result.response.ok) return sendJson(response, result.response.status, { message: result.data?.message || "Unable to update this product." });
    const data = result.data && typeof result.data === "object" ? result.data : {};
    return sendJson(response, 200, { ...data, success: true });
  } catch { return sendJson(response, 502, { message: "Unable to update this product." }); }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { readJson, readSession, sendJson, wordpressConfig, wordpressJson } from "./_session.js";
export default async function handler(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  if (!readSession(request)) return sendJson(response, 401, { message: "Your session has expired." });
  try {
    const body = await readJson(request);
    const productId = Number(body.product_id);
    const status = String(body.status || "");
    if (!Number.isInteger(productId) || productId <= 0 || !["publish", "draft"].includes(status)) return sendJson(response, 400, { message: "Invalid product update." });
    const { authorization } = wordpressConfig();
    const result = await wordpressJson("/wp-json/bridal/v1/update-product-status/", { method: "POST", headers: { Authorization: authorization, "Content-Type": "application/json" }, body: JSON.stringify({ product_id: productId, status }) });
    return sendJson(response, result.response.ok ? 200 : result.response.status, result.data);
  } catch { return sendJson(response, 502, { message: "Unable to update this product." }); }
}

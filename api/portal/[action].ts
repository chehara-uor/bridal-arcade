/* eslint-disable @typescript-eslint/no-explicit-any */
// Consolidated to stay under Vercel's Hobby-plan Serverless Function count:
// GET  /api/portal/dashboard       (was api/dashboard.ts)
// GET  /api/portal/recent-activity (was api/recent-activity.ts)
// GET  /api/portal/products        (was api/products.ts)
// GET  /api/portal/orders          (was api/orders.ts)
// POST /api/portal/product-status  (was api/product-status.ts)
// POST /api/portal/vendor-product  (was api/vendor-product.ts)
import { File } from "node:buffer";
import { readJson, requireBearer, sendJson, wordpressJson, wordpressUrl } from "../../lib/session.js";

const allowedProductFields = ["name", "description", "short_description", "sku", "regular_price", "sale_price", "parent", "child", "catalog_visibility", "manage_stock", "stock_quantity", "stock_status", "virtual", "owner_location", "owner_mobile", "owner_commission", "chest_size", "wear_count", "owner_declared_value"];

export default async function handler(request: any, response: any) {
  const action = new URL(request.url || "/", "http://localhost").pathname.split("/").pop();
  const authorization = requireBearer(request, response);
  if (!authorization) return;
  switch (action) {
    case "dashboard": return dashboard(request, response, authorization);
    case "recent-activity": return recentActivity(request, response, authorization);
    case "products": return products(request, response, authorization);
    case "orders": return orders(request, response, authorization);
    case "product-status": return productStatus(request, response, authorization);
    case "vendor-product": return vendorProduct(request, response, authorization);
    default: return sendJson(response, 404, { message: "Not found." });
  }
}

async function dashboard(request: any, response: any, authorization: string) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const email = new URL(request.url || "/", "http://localhost").searchParams.get("email") || "";
    const result = await wordpressJson(`/wp-json/bridal/v2/dashboard?email=${encodeURIComponent(email)}`, { headers: { Authorization: authorization } });
    if (!result.response.ok) return sendJson(response, result.response.status, { message: "Unable to load your dashboard." });
    return sendJson(response, 200, result.data);
  } catch (error) { console.error("dashboard failed:", error); return sendJson(response, 502, { message: "Unable to connect to Bridal Arcade." }); }
}

async function recentActivity(request: any, response: any, authorization: string) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const email = new URL(request.url || "/", "http://localhost").searchParams.get("email") || "";
    const query = new URLSearchParams({ owner_email: email, limit: "20" });
    const result = await wordpressJson(`/wp-json/lead-tracker/v1/recent-activity?${query}`, { headers: { Authorization: authorization } });
    if (!result.response.ok) return sendJson(response, result.response.status, { message: "Unable to load recent Lead Tracker activity." });
    return sendJson(response, 200, result.data);
  } catch (error) { console.error("recent-activity failed:", error); return sendJson(response, 502, { message: "Unable to connect to Lead Tracker." }); }
}

async function products(request: any, response: any, authorization: string) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const email = new URL(request.url || "/", "http://localhost").searchParams.get("email") || "";
    const query = new URLSearchParams({ email, page: "1", per_page: "50" });
    const result = await wordpressJson(`/wp-json/bridal/v2/productlist?${query.toString()}`, { headers: { Authorization: authorization } });
    if (!result.response.ok) return sendJson(response, result.response.status, { message: result.data?.message || "Unable to load products." });
    const list = Array.isArray(result.data) ? result.data : Array.isArray(result.data?.products) ? result.data.products : Array.isArray(result.data?.data) ? result.data.data : null;
    if (!list) return sendJson(response, 502, { message: "WordPress returned an invalid product list." });
    return sendJson(response, 200, list);
  } catch (error) { console.error("products failed:", error); return sendJson(response, 502, { message: "Unable to load products." }); }
}

async function orders(request: any, response: any, authorization: string) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const email = new URL(request.url || "/", "http://localhost").searchParams.get("email") || "";
    const result = await wordpressJson(`/wp-json/bridal/v1/orderlist?email=${encodeURIComponent(email)}`, { headers: { Authorization: authorization } });
    return sendJson(response, result.response.ok ? 200 : result.response.status, result.data);
  } catch (error) { console.error("orders failed:", error); return sendJson(response, 502, { message: "Unable to load orders." }); }
}

async function productStatus(request: any, response: any, authorization: string) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const productId = Number(body.product_id);
    const status = String(body.status || "");
    if (!Number.isInteger(productId) || productId <= 0 || !["publish", "draft"].includes(status)) return sendJson(response, 400, { message: "Invalid product update." });
    const result = await wordpressJson("/wp-json/bridal/v2/update-product-status", { method: "POST", headers: { Authorization: authorization, "Content-Type": "application/json" }, body: JSON.stringify({ product_id: productId, status }) });
    if (!result.response.ok) return sendJson(response, result.response.status, { message: result.data?.message || "Unable to update this product." });
    return sendJson(response, 200, result.data);
  } catch (error) { console.error("product-status failed:", error); return sendJson(response, 502, { message: "Unable to update this product." }); }
}

async function vendorProduct(request: any, response: any, authorization: string) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const contentType = String(request.headers["content-type"] || "");
    if (!contentType.startsWith("multipart/form-data")) return sendJson(response, 415, { message: "A multipart product submission is required." });
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 35 * 1024 * 1024) return sendJson(response, 413, { message: "The uploaded images are too large." });
      chunks.push(Buffer.from(chunk));
    }
    const incoming = new Request("http://localhost/upload", { method: "POST", headers: { "content-type": contentType }, body: Buffer.concat(chunks) });
    const submitted = await incoming.formData();
    const outgoing = new FormData();
    for (const field of allowedProductFields) {
      const values = submitted.getAll(field);
      for (const value of values) if (typeof value === "string") outgoing.append(field, value);
    }
    const availabilityType = submitted.get("availability_type");
    if (typeof availabilityType !== "string" || !["rent", "sale", "both"].includes(availabilityType)) return sendJson(response, 400, { message: "Choose whether the item is for rent, sale, or both." });
    outgoing.set("availability_type", availabilityType);
    const locations = submitted.getAll("owner_location[]").filter((value): value is string => typeof value === "string");
    if (locations.length) outgoing.set("owner_location", locations.join(", "));

    const mainImage = submitted.get("main_image");
    const gallery = submitted.getAll("gallery_images[]");
    if (!(mainImage instanceof File) || gallery.length !== 2 || gallery.some((image) => !(image instanceof File))) return sendJson(response, 400, { message: "Exactly three valid images are required." });
    outgoing.set("main_image", mainImage, mainImage.name || "main-image.jpg");
    for (const image of gallery as File[]) outgoing.append("gallery_images[]", image, image.name || "gallery-image.jpg");

    const url = wordpressUrl();
    const wordpress = await fetch(`${url}/wp-json/bridal/v2/products`, { method: "POST", cache: "no-store", headers: { Authorization: authorization, Accept: "application/json", "Cache-Control": "no-store" }, body: outgoing });
    const data = await wordpress.json().catch(() => ({ message: "WordPress returned an invalid product response." }));
    if (!wordpress.ok) return sendJson(response, wordpress.status, { message: data?.message || "The product could not be submitted." });
    return sendJson(response, 201, data);
  } catch (error) {
    console.error("vendor-product submission failed:", error);
    return sendJson(response, 502, { message: "Unable to submit the product to Bridal Arcade." });
  }
}

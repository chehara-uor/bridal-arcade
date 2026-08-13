/* eslint-disable @typescript-eslint/no-explicit-any */
import { readSession, sendJson, wordpressConfig } from "./_session.js";

const allowedFields = ["name", "description", "short_description", "sku", "regular_price", "sale_price", "parent", "child", "catalog_visibility", "manage_stock", "stock_quantity", "stock_status", "virtual", "owner_location", "owner_mobile", "owner_commission", "chest_size", "wear_count", "owner_declared_value"];

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  const session = readSession(request);
  if (!session) return sendJson(response, 401, { message: "Your verified registration session has expired. Please start again." });

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
    for (const field of allowedFields) {
      const values = submitted.getAll(field);
      for (const value of values) if (typeof value === "string") outgoing.append(field, value);
    }
    const availabilityType = submitted.get("availability_type");
    if (typeof availabilityType !== "string" || !["rent", "sale", "both"].includes(availabilityType)) return sendJson(response, 400, { message: "Choose whether the item is for rent, sale, or both." });
    outgoing.set("availability_type", availabilityType);
    const locations = submitted.getAll("owner_location[]").filter((value): value is string => typeof value === "string");
    if (locations.length) outgoing.set("owner_location", locations.join(", "));
    outgoing.set("author", session.id);

    const mainImage = submitted.get("main_image");
    const gallery = submitted.getAll("gallery_images[]");
    if (!(mainImage instanceof File) || gallery.length !== 2 || gallery.some((image) => !(image instanceof File))) return sendJson(response, 400, { message: "Exactly three valid images are required." });
    outgoing.set("main_image", mainImage, mainImage.name || "main-image.jpg");
    for (const image of gallery as File[]) outgoing.append("gallery_images[]", image, image.name || "gallery-image.jpg");

    const { url, authorization } = wordpressConfig();
    const wordpress = await fetch(`${url}/wp-json/bridal/v2/products`, { method: "POST", cache: "no-store", headers: { Authorization: authorization, Accept: "application/json", "Cache-Control": "no-store" }, body: outgoing });
    const data = await wordpress.json().catch(() => ({ message: "WordPress returned an invalid product response." }));
    if (!wordpress.ok) return sendJson(response, wordpress.status, { message: data?.message || "The product could not be submitted." });
    return sendJson(response, 201, data);
  } catch {
    return sendJson(response, 502, { message: "Unable to submit the product to Bridal Arcade." });
  }
}

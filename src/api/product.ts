import { apiClient } from "./client";
export interface SendProductStatusPayload { product_id: number; status: string; }
export async function sendProductStatus(payload: SendProductStatusPayload) {
  if (!Number.isInteger(payload.product_id) || payload.product_id <= 0) throw new Error("This product has an invalid ID and cannot be updated.");
  if (!["publish", "draft"].includes(payload.status)) throw new Error("This product status is invalid.");
  return (await apiClient.post("/portal/product-status", payload)).data;
}

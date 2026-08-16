import { apiClient } from "./client";
export interface SendProductStatusPayload { product_id: number; status: string; }
export interface ProductStatusResult {
  success: boolean;
  product_id: number;
  requested_status: "publish" | "draft" | "trash";
  new_status: "publish" | "draft" | "trash";
  plan_limited: boolean;
  message?: string;
}
export async function sendProductStatus(payload: SendProductStatusPayload): Promise<ProductStatusResult> {
  if (!Number.isInteger(payload.product_id) || payload.product_id <= 0) throw new Error("This product has an invalid ID and cannot be updated.");
  if (!["publish", "draft"].includes(payload.status)) throw new Error("This product status is invalid.");
  const data = (await apiClient.post("/portal/product-status", payload)).data;
  if (!["publish", "draft"].includes(data?.new_status)) throw new Error("The server returned an invalid product status.");
  return data as ProductStatusResult;
}

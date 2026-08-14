import { apiClient } from "./client";

export interface VendorProductResult { id: number; name?: string; status?: string; message?: string; }

export async function submitVendorProduct(form: FormData): Promise<VendorProductResult> {
  const response = await apiClient.post("/portal/vendor-product", form);
  return response.data as VendorProductResult;
}

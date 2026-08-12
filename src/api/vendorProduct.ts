import axios from "axios";

export interface VendorProductResult { id: number; name?: string; status?: string; message?: string; }

export async function submitVendorProduct(form: FormData): Promise<VendorProductResult> {
  const response = await axios.post("/api/vendor-product", form, { withCredentials: true });
  return response.data as VendorProductResult;
}

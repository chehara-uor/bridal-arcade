import axios from "axios";
import { apiClient } from "./client";

export interface ProductPlan {
  pricing_plan: string;
  published_count: number;
  plan_limit: number;
  at_limit: boolean;
}

export interface VendorProductResult {
  id: number;
  product_id?: number;
  main_image_id?: number;
  gallery_image_ids?: number[];
  name?: string;
  status?: string;
  message?: string;
  plan?: ProductPlan;
}

export async function submitVendorProduct(form: FormData): Promise<VendorProductResult> {
  if (!(form instanceof FormData)) throw new TypeError("Product submission requires FormData.");
  try {
    if (import.meta.env.DEV) {
      const { productFormDataDebugRows } = await import("./productFormData");
      console.table(productFormDataDebugRows(form));
    }
    // Do not set Content-Type here. Axios/browser supplies multipart/form-data
    // with the required boundary, and the shared client supplies Authorization.
    const response = await apiClient.post("/portal/vendor-product", form);
    const data = response.data ?? {};
    if (import.meta.env.DEV) {
      console.info("Product creation response", {
        product_id: data.product_id ?? data.id,
        main_image_id: data.main_image_id,
        gallery_image_ids: data.gallery_image_ids,
        status: data.status,
      });
    }
    return { ...data, id: Number(data.product_id ?? data.id) || 0 } as VendorProductResult;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Vendor product submission failed", {
        status: error.response?.status,
        body: error.response?.data,
      });
      if (error.response?.status === 409 && error.response?.data?.code === "duplicate_sku") {
        throw new Error(error.response.data.message || "That SKU already exists. The product was not created.");
      }
    }
    throw error;
  }
}

export function productPlanLimitMessage(result: VendorProductResult | null): string | null {
  const plan = result?.plan;
  if (!plan?.at_limit) return null;
  const limit = Number(plan.plan_limit);
  const limitLabel = Number.isFinite(limit) ? String(limit) : "available";
  const planName = String(plan.pricing_plan || "current").replace(/[_-]+/g, " ");
  return `You've used all ${limitLabel} listings on your ${planName} plan — this item was saved as a draft and won't publish until you free up a slot or upgrade.`;
}

export function productPlanNeedsUpgrade(result: VendorProductResult | null): boolean {
  const plan = result?.plan;
  if (!plan) return false;
  const limit = Number(plan.plan_limit);
  const published = Number(plan.published_count);
  return plan.at_limit || (Number.isFinite(limit) && Number.isFinite(published) && limit > 0 && published >= limit - 1);
}

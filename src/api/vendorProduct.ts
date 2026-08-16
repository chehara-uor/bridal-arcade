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
  name?: string;
  status?: string;
  message?: string;
  plan?: ProductPlan;
}

export async function submitVendorProduct(form: FormData): Promise<VendorProductResult> {
  const response = await apiClient.post("/portal/vendor-product", form);
  const data = response.data ?? {};
  return { ...data, id: Number(data.product_id ?? data.id) || 0 } as VendorProductResult;
}

export function productPlanLimitMessage(result: VendorProductResult | null): string | null {
  const plan = result?.plan;
  if (!plan?.at_limit) return null;
  const limit = Number(plan.plan_limit);
  const limitLabel = Number.isFinite(limit) ? String(limit) : "available";
  const planName = String(plan.pricing_plan || "current").replace(/[_-]+/g, " ");
  return `You've used all ${limitLabel} listings on your ${planName} plan — this item was saved as a draft and won't publish until you free up a slot or upgrade.`;
}

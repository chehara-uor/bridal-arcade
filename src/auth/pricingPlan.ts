export type PricingPlan = "free" | "basic" | "standard";

export function normalizePricingPlan(value: unknown): PricingPlan {
  return value === "basic" || value === "standard" ? value : "free";
}

export function pricingPlanLabel(value: unknown): string {
  const plan = normalizePricingPlan(value);
  return `${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan`;
}

export function getStoredPricingPlan(): PricingPlan {
  return normalizePricingPlan(sessionStorage.getItem("pricingPlan"));
}

export function pricingPlanWhatsAppUrl(plan: PricingPlan): string {
  const name = `${plan.charAt(0).toUpperCase()}${plan.slice(1)}`;
  const message = encodeURIComponent(`Hi, I want to switch to the ${name} plan.`);
  return `https://wa.me/94707997883?text=${message}`;
}

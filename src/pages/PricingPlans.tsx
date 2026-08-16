import { Check, Crown, ShieldCheck } from "lucide-react";
import AppShell from "../components/AppShell";
import VendorShell from "../components/VendorShell";
import { getStoredPricingPlan, pricingPlanLabel, pricingPlanWhatsAppUrl, type PricingPlan } from "../auth/pricingPlan";

interface PlanDetails {
  id: PricingPlan;
  name: string;
  price: number;
  description: string;
  features: string[];
  action: string;
  featured?: boolean;
}

const plans: PlanDetails[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "A simple start for listing one special bridal piece.",
    features: ["1 active listing at a time", "Live for 45 days", "Direct WhatsApp contact", "Visible to all brides", "Expiry reminder before the listing ends"],
    action: "Choose Free",
  },
  {
    id: "basic",
    name: "Basic",
    price: 490,
    description: "Built for owners with a small collection ready to reach more brides.",
    features: ["Up to 3 active listings", "Live for 60 days per listing", "Direct WhatsApp contact", "Priority placement in results", "Expiry reminder before each listing ends"],
    action: "Choose Basic",
    featured: true,
  },
  {
    id: "standard",
    name: "Standard",
    price: 890,
    description: "Maximum listing room and visibility for an established collection.",
    features: ["Up to 5 active listings", "Live for 180 days per listing", "Direct WhatsApp contact", "Featured badge on every listing", "Expiry reminder before each listing ends"],
    action: "Choose Standard",
  },
];

export default function PricingPlans({ portal }: { portal: "vendor" | "individual" }) {
  const currentPlan = getStoredPricingPlan();
  const Shell = portal === "vendor" ? VendorShell : AppShell;

  return (
    <Shell>
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-7 sm:py-9 xl:px-10">
        <header className="relative overflow-hidden rounded-[30px] bg-[#2d1723] px-5 py-9 text-white shadow-[0_24px_70px_rgba(45,23,35,.2)] sm:px-9 sm:py-12 lg:px-12">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-4 -top-12 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute bottom-[-120px] left-1/3 h-64 w-64 rounded-full bg-[#b9964c]/15 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[.14em] text-[#e0c680]"><ShieldCheck size={15} /> Your current plan: {pricingPlanLabel(currentPlan)}</span>
            <h1 className="display-font mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Choose the space your collection needs.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">Every plan is a one-time payment with no subscription. Select a plan below and WhatsApp our team to switch.</p>
          </div>
        </header>

        <section className="relative z-10 mt-6 grid items-stretch gap-5 lg:-mt-8 lg:grid-cols-3 lg:px-5">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <article key={plan.id} className={`relative flex min-h-full flex-col overflow-hidden rounded-[26px] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(55,28,40,.14)] sm:p-8 ${plan.featured ? "border-[#7a2352] bg-[#321a27] text-white shadow-[0_22px_55px_rgba(55,28,40,.22)] lg:-translate-y-4 lg:hover:-translate-y-5" : "border-border-light bg-white shadow-[0_16px_45px_rgba(55,28,40,.07)]"} ${isCurrent ? "ring-2 ring-[#d5b466] ring-offset-4" : ""}`}>
                <div className="flex min-h-8 items-center justify-between gap-3">
                  {plan.featured ? <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[#e0c680]"><Crown size={13} /> Most popular</span> : <span />}
                  {isCurrent && <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] ${plan.featured ? "bg-[#d5b466] text-[#2d1723]" : "bg-primary text-white"}`}>Current plan</span>}
                </div>

                <div className="mt-7">
                  <h2 className={`display-font text-3xl font-bold ${plan.featured ? "text-white" : "text-primary"}`}>{plan.name}</h2>
                  <p className={`mt-3 min-h-12 text-sm leading-6 ${plan.featured ? "text-white/60" : "text-muted-foreground"}`}>{plan.description}</p>
                </div>

                <div className={`mt-7 flex items-end gap-2 border-b pb-7 ${plan.featured ? "border-white/10" : "border-border-light"}`}>
                  <span className={`pb-2 text-sm font-bold ${plan.featured ? "text-[#e0c680]" : "text-primary"}`}>LKR</span>
                  <span className="text-6xl font-bold tracking-[-.06em] sm:text-7xl">{plan.price.toLocaleString()}</span>
                  <span className={`pb-2 text-xs ${plan.featured ? "text-white/45" : "text-muted-foreground"}`}>one time</span>
                </div>

                <ul className="mt-7 flex-1 space-y-4">
                  {plan.features.map((feature) => <li key={feature} className={`flex gap-3 text-sm leading-5 ${plan.featured ? "text-white/85" : "text-foreground/80"}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${plan.featured ? "bg-white/10 text-[#e0c680]" : "bg-accent text-primary"}`}><Check size={13} strokeWidth={3} /></span><span>{feature}</span></li>)}
                </ul>

                <a href={pricingPlanWhatsAppUrl(plan.id)} target="_blank" rel="noopener noreferrer" className={`mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-bold transition active:scale-[.98] ${plan.featured ? "bg-white text-[#321a27] hover:bg-[#f7edda]" : "bg-primary text-white hover:bg-primary-hover"}`} aria-label={`${plan.action} through WhatsApp`}>
                  {plan.action}
                </a>
                <p className={`mt-3 text-center text-[11px] ${plan.featured ? "text-white/40" : "text-muted-foreground"}`}>Opens WhatsApp to contact Bridal Arcade</p>
              </article>
            );
          })}
        </section>

        <footer className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border-light bg-white px-5 py-5 text-center text-sm leading-6 text-muted-foreground shadow-sm lg:mt-4">
          Need help choosing? Every plan button opens WhatsApp with the selected plan already included in your message. No credit card is required on this page.
        </footer>
      </div>
    </Shell>
  );
}

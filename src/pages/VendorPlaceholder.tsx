import { Building2, Package, ReceiptText, UserRound } from "lucide-react";
import VendorShell from "../components/VendorShell";

const content = {
  profile: { title: "Vendor Profile", description: "Your public shop profile editor will live here when the WordPress Vendor API is connected.", icon: Building2 },
  products: { title: "My Listings", description: "Vendor product management is ready to be connected without changing the existing bride product flow.", icon: Package },
  orders: { title: "Vendor Orders", description: "Business orders will appear here when the vendor order API is available.", icon: ReceiptText },
  account: { title: "Shop Account", description: "Manage business account and security settings here.", icon: UserRound },
};

export default function VendorPlaceholder({ page }: { page: keyof typeof content }) { const item = content[page]; const Icon = item.icon; return <VendorShell><div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-9"><p className="eyebrow">Shop portal</p><h1 className="page-title mt-2">{item.title}</h1><div className="surface-card mt-8 grid min-h-80 place-items-center p-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary"><Icon/></span><h2 className="display-font mt-5 text-2xl font-bold">Coming next</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{item.description}</p></div></div></div></VendorShell>; }

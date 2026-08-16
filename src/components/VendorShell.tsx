import { BadgeDollarSign, Building2, LayoutDashboard, LogOut, Package, Plus, ReceiptText, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { logoutPartner } from "../api/portal";
import { getStoredPricingPlan, pricingPlanLabel } from "../auth/pricingPlan";

const items = [
  { label: "Dashboard", path: "/vendor/dashboard", icon: LayoutDashboard },
  { label: "Profile", path: "/vendor/profile", icon: Building2 },
  { label: "Products", path: "/vendor/products", icon: Package },
  { label: "Orders", path: "/vendor/orders", icon: ReceiptText },
  { label: "Plans", path: "/vendor/plans", icon: BadgeDollarSign },
  { label: "Account", path: "/vendor/account", icon: UserRound },
];

export default function VendorShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const name = sessionStorage.getItem("userName") || "Shop";
  const pricingPlan = getStoredPricingPlan();
  const logout = async () => { await logoutPartner(); navigate("/", { replace: true }); };
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[264px_1fr]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-white/10 bg-[#2d1723] px-5 py-6 text-white lg:flex"><div className="flex items-center gap-3 px-2"><img src={Logo} alt="Bridal Arcade" className="h-11 w-11 rounded-xl bg-white p-1"/><div><p className="display-font text-lg font-bold">Bridal Arcade</p><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b466]">Shop portal</p></div></div><nav className="mt-10 space-y-1.5">{items.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} className={({isActive}) => `flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition ${isActive ? "bg-white text-[#3a1b2b]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon size={19}/>{label}</NavLink>)}</nav><div className="mt-auto rounded-2xl bg-white/[.06] p-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#d5b466] font-bold text-[#2d1723]">{name.charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span><button onClick={logout} aria-label="Sign out" className="grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"><LogOut size={17}/></button></div><div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#e0c680]">{pricingPlanLabel(pricingPlan)}</span>{pricingPlan === "free" && <NavLink to="/vendor/plans" className="text-xs font-bold text-white hover:text-[#e0c680]">View plans</NavLink>}</div></div></aside>
    <main className="min-w-0 pb-24 lg:col-start-2 lg:pb-8">{children}</main>
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-light bg-white/95 px-1 py-2 backdrop-blur lg:hidden"><div className="mx-auto flex max-w-lg justify-around">{items.map(({label,path,icon:Icon}) => <NavLink key={path} to={path} className={({isActive}) => `flex min-h-14 min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-semibold ${isActive ? "bg-primary/8 text-primary" : "text-muted-foreground"}`}><Icon size={19}/>{label}</NavLink>)}</div></nav>
  </div>;
}

export function AddListingButton() { return <NavLink to="/vendor/products" className="primary-button"><Plus size={17}/>Add Listing</NavLink>; }

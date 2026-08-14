import { LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { logoutPartner } from "../api/portal";

const items = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = async () => { await logoutPartner(); navigate("/", { replace: true }); };
  const navigation = <>
    <div className="flex items-center gap-3 px-2">
      <img src={Logo} alt="Bridal Arcade" className="h-11 w-11 rounded-xl bg-white p-1 shadow-lg" />
      <div><p className="display-font text-lg font-bold">Bridal Arcade</p><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b466]">Super admin</p></div>
    </div>
    <nav className="mt-10 space-y-1.5" aria-label="Admin navigation">
      {items.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition ${isActive ? "bg-white text-[#3a1b2b] shadow-lg" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon size={19} />{label}</NavLink>)}
    </nav>
    <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.06] p-3.5">
      <p className="truncate text-sm font-semibold">{sessionStorage.getItem("userName") || "Administrator"}</p>
      <p className="mt-0.5 truncate text-xs text-white/45">{sessionStorage.getItem("userEmail")}</p>
      <button onClick={logout} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-white/65 hover:bg-white/10 hover:text-white"><LogOut size={16} />Sign out</button>
    </div>
  </>;
  return <div className="min-h-screen bg-[#f8f6f3] lg:grid lg:grid-cols-[264px_1fr]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col bg-[#2d1723] px-5 py-6 text-white lg:flex">{navigation}</aside>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close menu" className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} /><aside className="relative flex h-full w-[280px] flex-col bg-[#2d1723] px-5 py-6 text-white shadow-2xl"><button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10"><X size={20} /></button>{navigation}</aside></div>}
    <main className="min-w-0 lg:col-start-2"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-border-light bg-white/90 px-5 backdrop-blur lg:hidden"><button onClick={() => setOpen(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-xl border"><Menu size={20} /></button><span className="ml-3 font-semibold">Super Admin</span></header>{children}</main>
  </div>;
}

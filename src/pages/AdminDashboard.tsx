import { ArrowRight, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AdminShell from "../components/AdminShell";

export default function AdminDashboard() {
  return <AdminShell><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <p className="eyebrow">Administration</p>
    <h1 className="page-title mt-2">Welcome, {sessionStorage.getItem("userName") || "Administrator"}</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Manage Bridal Arcade member access and review every user's product listings from one place.</p>
    <div className="mt-9 grid gap-5 md:grid-cols-2">
      <Link to="/admin/users" className="surface-card group p-6 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Users size={24} /></span>
        <h2 className="display-font mt-6 text-2xl font-bold">Manage Users</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Search accounts, filter member types, activate or deactivate access, and review product listings.</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">Open users <ArrowRight size={17} className="transition group-hover:translate-x-1" /></span>
      </Link>
      <div className="surface-card p-6 sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d5b466]/15 text-[#8b6a21]"><ShieldCheck size={24} /></span><h2 className="display-font mt-6 text-2xl font-bold">Admin workspace</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">This workspace is isolated from seller product and add-product pages. Your administrator session protects every action.</p></div>
    </div>
  </div></AdminShell>;
}

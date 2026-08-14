import { ChevronLeft, ChevronRight, Loader2, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAdminUsers, updateAdminUserStatus, type AdminUser, type UsersResult } from "../api/admin";
import { getRequestErrorMessage } from "../api/portal";
import AdminShell from "../components/AdminShell";

const empty: UsersResult = { users: [], page: 1, per_page: 10, total: 0, total_pages: 1 };

export default function AdminUsers() {
  const [result, setResult] = useState(empty);
  const [filters, setFilters] = useState({ search: "", role: "", status: "", page: 1, per_page: 10 });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => { const timer = window.setTimeout(() => setFilters((old) => ({ ...old, search: query.trim(), page: 1 })), 350); return () => window.clearTimeout(timer); }, [query]);
  useEffect(() => {
    let live = true; setLoading(true);
    fetchAdminUsers(filters).then((data) => { if (live) setResult(data); }).catch((error) => toast.error(getRequestErrorMessage(error, "Unable to load users."))).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [filters]);

  const toggle = async (event: React.MouseEvent, user: AdminUser) => {
    event.stopPropagation();
    const status = user.profile_status === "active" ? "inactive" : "active";
    setChanging(user.id);
    try {
      const response = await updateAdminUserStatus(user, status);
      const updated = response?.user ?? response?.updated_user ?? response;
      setResult((old) => ({ ...old, users: old.users.map((item) => item.id === user.id ? { ...item, profile_status: updated?.profile_status === "inactive" ? "inactive" : status } : item) }));
      const drafted = Number(response?.drafted_post_count ?? response?.drafted_post_ids?.length ?? 0);
      toast.success(status === "inactive" && drafted ? `User deactivated. ${drafted} product${drafted === 1 ? "" : "s"} moved to draft.` : `User marked ${status}.`);
    } catch (error) { toast.error(getRequestErrorMessage(error, "Unable to update this user.")); }
    finally { setChanging(null); }
  };

  return <AdminShell><div className="mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <div className="flex items-start gap-4"><span className="mt-1 hidden h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary sm:grid"><Users /></span><div><p className="eyebrow">Super Admin</p><h1 className="page-title mt-1">Manage Users</h1><p className="mt-2 text-sm text-muted-foreground">Control account access and inspect member products.</p></div></div>
    <section className="surface-card mt-7 overflow-hidden">
      <div className="grid gap-3 border-b border-border-light p-4 sm:grid-cols-[1fr_180px_160px_120px]">
        <label className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="field-input pl-10" placeholder="Search name or email…" /></label>
        <select className="field-input" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}><option value="">All roles</option><option value="customer">Customer</option><option value="vendor">Vendor</option><option value="administrator">Administrator</option></select>
        <select className="field-input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        <select className="field-input" value={filters.per_page} onChange={(e) => setFilters({ ...filters, per_page: Number(e.target.value), page: 1 })}><option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option></select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3.5">User</th><th className="px-4 py-3.5">Role</th><th className="px-4 py-3.5">Account type</th><th className="px-4 py-3.5">Products</th><th className="px-5 py-3.5 text-right">Status</th></tr></thead>
          <tbody className="divide-y divide-border-light">{!loading && result.users.map((user) => <tr key={user.id} onClick={() => navigate(`/admin/users/${encodeURIComponent(user.email)}`)} className="cursor-pointer bg-white transition hover:bg-accent/25"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span><div><p className="font-semibold">{user.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p></div></div></td><td className="px-4 py-4 capitalize">{user.roles.join(", ").replace(/_/g, " ") || "—"}</td><td className="px-4 py-4 capitalize">{user.account_type}</td><td className="px-4 py-4 font-semibold">{user.product_count}</td><td className="px-5 py-4"><div className="flex justify-end"><button role="switch" aria-checked={user.profile_status === "active"} disabled={changing === user.id || user.roles.includes("administrator")} onClick={(event) => toggle(event, user)} className={`relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-45 ${user.profile_status === "active" ? "bg-emerald-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${user.profile_status === "active" ? "left-6" : "left-1"}`} /></button><span className={`ml-2 min-w-14 text-xs font-bold ${user.profile_status === "active" ? "text-emerald-700" : "text-muted-foreground"}`}>{changing === user.id ? "Saving…" : user.profile_status === "active" ? "Active" : "Inactive"}</span></div></td></tr>)}</tbody>
        </table>
        {loading && <div className="grid min-h-56 place-items-center text-muted-foreground"><Loader2 className="animate-spin" /></div>}
        {!loading && !result.users.length && <div className="px-5 py-16 text-center"><Users className="mx-auto text-muted-foreground/40" size={34} /><p className="mt-3 font-semibold">No users found</p><p className="mt-1 text-sm text-muted-foreground">Try changing your search or filters.</p></div>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-light px-5 py-4 text-sm"><p className="text-muted-foreground">{result.total} user{result.total === 1 ? "" : "s"} · Page {result.page} of {result.total_pages}</p><div className="flex gap-2"><button className="secondary-button min-h-9 px-3" disabled={filters.page <= 1 || loading} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}><ChevronLeft size={16} />Previous</button><button className="secondary-button min-h-9 px-3" disabled={filters.page >= result.total_pages || loading} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next<ChevronRight size={16} /></button></div></div>
    </section>
  </div></AdminShell>;
}

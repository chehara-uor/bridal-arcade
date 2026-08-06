import { useEffect, useState } from "react";
import { ArrowRight, CalendarCheck2, CircleDollarSign, Clock3, Package, ReceiptText, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { fetchDashboard, fetchOrders, fetchProducts, getRequestErrorMessage, readSessionCache } from "../api/portal";

interface RecentActivity { id: number; type: string; time_ago: string; }
interface Stats { totalSales: number; totalOrders: number; categories: string[]; }

export default function Dashboard() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState<Stats>({ totalSales: 0, totalOrders: 0, categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const name = sessionStorage.getItem("userName") || "Partner";

  const loadDashboard = async () => {
    setLoading(true); setError("");
    const cached = readSessionCache<Record<string, unknown>>("dashboardData");
    const validCache = cached && typeof cached === "object" && !Array.isArray(cached) ? cached : null;
    if (validCache) {
      const cachedView = normalizeDashboard(validCache);
      setStats(cachedView.stats);
      setActivities(cachedView.activities);
      setLoading(false);
    }
    try {
      const data = await fetchDashboard();
      sessionStorage.setItem("dashboardData", JSON.stringify(data));
      const view = normalizeDashboard(data);
      setStats(view.stats);
      setActivities(view.activities);
    } catch (requestError) {
      const message = getRequestErrorMessage(requestError, "We couldn't load your overview. Please try again.");
      setError(validCache ? `${message} Showing your last saved overview.` : message);
    }
    finally { setLoading(false); }
  };

  const prefetch = async (key: string, request: (email: string) => Promise<unknown>) => {
    if (sessionStorage.getItem(key)) return;
    try {
      const data = await request(sessionStorage.getItem("userEmail") || "");
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch { /* The destination page will display its empty state. */ }
  };

  useEffect(() => {
    loadDashboard();
    prefetch("productData", fetchProducts);
    prefetch("orderData", fetchOrders);
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
        <header className="mb-7 flex items-start justify-between gap-4 sm:mb-9">
          <div><p className="eyebrow">Today at a glance</p><h1 className="page-title mt-1.5">Hello, {name}</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">Here’s how your rental collection is performing.</p></div>
          <Link to="/my-account" className="hidden h-12 items-center gap-3 rounded-full border border-border bg-white pl-2 pr-4 shadow-sm transition hover:border-primary/25 sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-white">{name.charAt(0).toUpperCase()}</span><span className="text-sm font-semibold">My account</span>
          </Link>
        </header>

        {error && <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/15 bg-destructive/5 p-4 text-sm"><span>{error}</span><button onClick={loadDashboard} className="font-bold text-destructive">Retry</button></div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<CircleDollarSign />} label="Total earnings" value={`LKR ${stats.totalSales.toLocaleString()}`} note="Your rental profit" loading={loading} feature />
          <MetricCard icon={<ReceiptText />} label="Total orders" value={String(stats.totalOrders)} note="Across all statuses" loading={loading} />
          <MetricCard icon={<Package />} label="Categories" value={String(stats.categories.length)} note="In your collection" loading={loading} />
          <MetricCard icon={<TrendingUp />} label="Portal status" value="Active" note="Your store is connected" loading={loading} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-light px-5 py-5 sm:px-6">
              <div><h2 className="display-font text-xl font-bold">Recent activity</h2><p className="mt-1 text-sm text-muted-foreground">Latest movement across your account</p></div><Clock3 size={20} className="text-primary/60" />
            </div>
            <div className="p-3 sm:p-4">
              {loading ? <ActivitySkeleton /> : activities.length ? activities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex gap-3 rounded-xl px-2 py-3.5 transition hover:bg-muted/60 sm:px-3">
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-primary"><CalendarCheck2 size={17} /></span>
                  <div className="min-w-0"><p className="text-sm font-semibold leading-5">{activity.type}</p><p className="mt-1 text-xs text-muted-foreground">{activity.time_ago}</p></div>
                </div>
              )) : <EmptyActivity />}
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-[#321a27] p-6 text-white shadow-[0_15px_40px_rgba(50,26,39,.18)]">
              <Sparkles className="absolute -right-3 -top-3 h-28 w-28 text-white/[0.04]" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d5b466]">Quick action</p><h2 className="display-font mt-3 text-2xl font-bold">Keep your collection ready</h2><p className="mt-3 text-sm leading-6 text-white/60">Update availability whenever an item becomes ready to rent again.</p>
              <Link to="/products" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#321a27] transition hover:bg-[#f7edda]">Manage items <ArrowRight size={17} /></Link>
            </div>
            <div className="surface-card p-5 sm:p-6">
              <p className="eyebrow">Your categories</p>
              <div className="mt-4 flex flex-wrap gap-2">{loading ? <span className="h-8 w-28 animate-pulse rounded-full bg-muted" /> : stats.categories.length ? stats.categories.map((category) => <span key={category} className="rounded-full border border-primary/10 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">{category}</span>) : <p className="text-sm text-muted-foreground">No categories to show yet.</p>}</div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({ icon, label, value, note, loading, feature = false }: { icon: React.ReactNode; label: string; value: string; note: string; loading: boolean; feature?: boolean }) {
  return <div className={`rounded-2xl border p-5 shadow-[0_10px_35px_rgba(55,28,40,.05)] sm:p-6 ${feature ? "border-primary/10 bg-primary text-white" : "border-border-light bg-white"}`}>
    <div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl [&>svg]:h-5 [&>svg]:w-5 ${feature ? "bg-white/12 text-[#e0c680]" : "bg-accent text-primary"}`}>{icon}</span></div>
    <p className={`mt-5 text-xs font-bold uppercase tracking-[0.12em] ${feature ? "text-white/55" : "text-muted-foreground"}`}>{label}</p>
    {loading ? <div className={`mt-2 h-9 w-28 animate-pulse rounded-lg ${feature ? "bg-white/10" : "bg-muted"}`} /> : <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>}
    <p className={`mt-2 text-xs ${feature ? "text-white/50" : "text-muted-foreground"}`}>{note}</p>
  </div>;
}

function ActivitySkeleton() { return <div className="space-y-2">{[1,2,3,4].map((n) => <div key={n} className="flex gap-3 p-3"><div className="h-9 w-9 animate-pulse rounded-full bg-muted"/><div className="flex-1"><div className="h-4 w-2/3 animate-pulse rounded bg-muted"/><div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted"/></div></div>)}</div>; }
function EmptyActivity() { return <div className="grid min-h-56 place-items-center px-6 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground"><Clock3 size={20}/></span><p className="mt-3 font-semibold">No recent activity</p><p className="mt-1 text-sm text-muted-foreground">New order updates will appear here.</p></div></div>; }
function normalizeActivity(value: unknown, index: number): RecentActivity | null { if (!value || typeof value !== "object") return null; const item = value as Record<string, unknown>; const type = String(item.type || "").trim(); if (!type) return null; return { id: Number(item.id) || index + 1, type, time_ago: String(item.time_ago || "Recently") }; }
function normalizeDashboard(value: unknown): { stats: Stats; activities: RecentActivity[] } { const payload = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; const activity = payload.lead_tracker_activity ?? payload.recent_activity ?? payload.activity; return { stats: { totalSales: Number(payload.total_sales) || 0, totalOrders: Number(payload.orders) || 0, categories: Array.isArray(payload.categories) ? payload.categories.filter((item): item is string => typeof item === "string") : [] }, activities: Array.isArray(activity) ? activity.map((item, index) => normalizeActivity(item, index)).filter((item): item is RecentActivity => item !== null) : [] }; }

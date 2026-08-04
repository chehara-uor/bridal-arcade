import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleDollarSign, PackageOpen, ReceiptText, Search } from "lucide-react";
import AppShell from "../components/AppShell";
import { fetchOrders, getRequestErrorMessage, readSessionCache } from "../api/portal";

interface Order { id: string; commission: number; status: string; orderDate: string; customer: string; product: string; totalAmount: number; }
type Filter = "All" | "Booked" | "Completed" | "Cancelled";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true); setError("");
    const cached = readSessionCache<Order[]>("orderData");
    const cachedOrders = Array.isArray(cached) ? cached.map(normalizeOrder).filter((order): order is Order => order !== null) : null;
    if (cachedOrders) {
      setOrders(cachedOrders);
      setLoading(false);
    }
    try {
      const raw = await fetchOrders(sessionStorage.getItem("userEmail") || "") as unknown[];
      const data = raw.map(normalizeOrder).filter((order): order is Order => order !== null);
      sessionStorage.setItem("orderData", JSON.stringify(data));
      setOrders(data);
    } catch (requestError) {
      const message = getRequestErrorMessage(requestError, "We couldn't load your orders. Please try again.");
      setError(cachedOrders ? `${message} Showing your last saved order list.` : message);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, []);
  const filtered = useMemo(() => orders.filter((order) => (filter === "All" || order.status === filter) && `${order.id} ${order.product} ${order.customer || ""}`.toLowerCase().includes(query.toLowerCase())), [orders, filter, query]);
  const total = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const filters: Filter[] = ["All", "Booked", "Completed", "Cancelled"];

  return <AppShell><div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
    <header><p className="eyebrow">Rental activity</p><h1 className="page-title mt-1.5">Orders</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">Follow every booking from confirmation to completion.</p></header>
    <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4"><OrderStat icon={<ReceiptText/>} label="Total orders" value={orders.length.toString()}/><OrderStat icon={<CircleDollarSign/>} label="Total profit" value={`LKR ${total.toLocaleString()}`}/><OrderStat icon={<CalendarDays/>} label="Booked" value={orders.filter((o) => o.status === "Booked").length.toString()}/><OrderStat icon={<PackageOpen/>} label="Completed" value={orders.filter((o) => o.status === "Completed").length.toString()}/></section>
    <div className="mt-6 space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0"><label className="relative block w-full sm:max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} className="field-input pl-11" placeholder="Search order or item" aria-label="Search orders"/></label><div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${filter === item ? "bg-primary text-white" : "border border-border bg-white text-muted-foreground"}`}>{item}<span className="ml-1.5 opacity-70">{item === "All" ? orders.length : orders.filter((o) => o.status === item).length}</span></button>)}</div></div>
    {error && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/15 bg-destructive/5 p-4 text-sm"><span>{error}</span><button onClick={loadOrders} className="font-bold text-destructive">Retry</button></div>}
    {loading ? <OrderLoading /> : filtered.length ? <><div className="mt-5 grid gap-4 xl:hidden">{filtered.map((order, index) => <OrderCard key={order.id} order={order} index={index}/>)}</div><div className="surface-card mt-5 hidden overflow-hidden xl:block"><table className="w-full"><thead><tr className="border-b border-border-light bg-muted/50 text-left text-xs font-bold uppercase tracking-[.1em] text-muted-foreground"><th className="px-6 py-4">Order</th><th className="px-5 py-4">Item</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Commission</th><th className="px-5 py-4">Profit</th><th className="px-6 py-4 text-right">Status</th></tr></thead><tbody>{filtered.map((order, index) => <tr key={order.id} className="border-b border-border-light last:border-0 hover:bg-muted/30"><td className="px-6 py-5"><p className="font-bold">#{order.id}</p><p className="mt-1 text-xs text-muted-foreground">{order.customer || `Customer ${index + 1}`}</p></td><td className="max-w-xs px-5 py-5 text-sm font-semibold">{order.product}</td><td className="px-5 py-5 text-sm text-muted-foreground">{formatDate(order.orderDate)}</td><td className="px-5 py-5 text-sm font-semibold text-primary">{order.commission}%</td><td className="px-5 py-5 text-sm font-bold">LKR {Number(order.totalAmount).toLocaleString()}</td><td className="px-6 py-5 text-right"><OrderStatus status={order.status}/></td></tr>)}</tbody></table></div></> : <div className="surface-card mt-5 grid min-h-72 place-items-center px-6 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-primary"><ReceiptText size={23}/></span><h2 className="display-font mt-4 text-xl font-bold">No orders found</h2><p className="mt-2 text-sm text-muted-foreground">{query || filter !== "All" ? "Try another search or status." : "New rental orders will appear here."}</p></div></div>}
  </div></AppShell>;
}

function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
function OrderStatus({ status }: { status: string }) { const style = status === "Completed" ? "bg-success/10 text-success" : status === "Booked" ? "bg-primary/10 text-primary" : status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"; return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${style}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{status}</span>; }
function OrderStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="surface-card p-4 sm:p-5"><div className="flex items-center gap-3"><span className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary [&>svg]:h-5 [&>svg]:w-5 sm:grid">{icon}</span><div className="min-w-0"><p className="truncate text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground sm:text-xs">{label}</p><p className="mt-1 truncate text-lg font-bold sm:text-xl">{value}</p></div></div></div>; }
function OrderCard({ order, index }: { order: Order; index: number }) { return <article className="surface-card p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">Order #{order.id}</p><h2 className="mt-2 font-bold leading-5">{order.product}</h2></div><OrderStatus status={order.status}/></div><div className="mt-4 grid grid-cols-2 gap-y-4 rounded-xl bg-muted/55 p-3.5 sm:grid-cols-4"><Detail label="Customer" value={order.customer || `Customer ${index + 1}`}/><Detail label="Order date" value={formatDate(order.orderDate)}/><Detail label="Commission" value={`${order.commission}%`}/><Detail label="Profit" value={`LKR ${Number(order.totalAmount).toLocaleString()}`} strong/></div></article>; }
function Detail({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div><p className="text-[11px] font-semibold text-muted-foreground">{label}</p><p className={`mt-1 text-sm ${strong ? "font-bold text-primary" : "font-semibold"}`}>{value}</p></div>; }
function OrderLoading() { return <div className="mt-5 space-y-4">{[1,2,3,4].map((item) => <div key={item} className="surface-card p-4 sm:p-5"><div className="flex justify-between gap-4"><div className="h-4 w-36 animate-pulse rounded bg-muted"/><div className="h-6 w-20 animate-pulse rounded-full bg-muted"/></div><div className="mt-4 h-20 animate-pulse rounded-xl bg-muted"/></div>)}</div>; }
function normalizeOrder(value: unknown): Order | null { if (!value || typeof value !== "object") return null; const item = value as Record<string, unknown>; const id = String(item.id || "").trim(); if (!id) return null; const amount = Number(item.totalAmount); const commission = Number(item.commission); return { id, commission: Number.isFinite(commission) ? commission : 0, status: String(item.status || "Pending"), orderDate: String(item.orderDate || ""), customer: String(item.customer || ""), product: String(item.product || "Rental item"), totalAmount: Number.isFinite(amount) ? amount : 0 }; }

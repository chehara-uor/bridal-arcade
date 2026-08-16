import { useEffect, useMemo, useState } from "react";
import { Check, ImageOff, Package, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import AppShell from "../components/AppShell";
import { sendProductStatus } from "../api/product";
import { fetchProducts, getRequestErrorMessage, readSessionCache } from "../api/portal";

interface Product { id: number; name: string; price: number; thumbnail: string; is_booked: string; sku: number | string; category: string; status: "Available" | "Draft" | "Rented"; }
type Filter = "All" | "Available" | "Draft";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true); setError("");
    const cached = readSessionCache<Product[]>("productData");
    const cachedProducts = Array.isArray(cached) ? cached.map(normalizeProduct).filter((product): product is Product => product !== null) : null;
    if (cachedProducts) {
      setProducts(cachedProducts);
      setLoading(false);
    }
    try {
      const raw = await fetchProducts(sessionStorage.getItem("userEmail") || "") as unknown[];
      const data = raw.map(normalizeProduct).filter((product): product is Product => product !== null);
      sessionStorage.setItem("productData", JSON.stringify(data));
      setProducts(data);
    } catch (requestError) {
      const message = getRequestErrorMessage(requestError, "We couldn't load your items. Please try again.");
      setError(cachedProducts ? `${message} Showing your last saved item list.` : message);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  const effectiveStatus = (product: Product) => product.is_booked === "1" ? "Rented" : product.status;
  const filtered = useMemo(() => products.filter((product) => {
    const matchesFilter = filter === "All" || effectiveStatus(product) === filter;
    const text = `${product.name} ${product.category} ${product.sku}`.toLowerCase();
    return matchesFilter && text.includes(query.trim().toLowerCase());
  }), [products, filter, query]);

  const toggleStatus = async (product: Product) => {
    if (product.is_booked === "1") return;
    const next: Product["status"] = product.status === "Draft" ? "Available" : "Draft";
    setUpdating(product.id);
    try {
      const result = await sendProductStatus({ product_id: product.id, status: next === "Available" ? "publish" : "draft" });
      if (result?.success) {
        const actualStatus: Product["status"] = result.new_status === "publish" ? "Available" : "Draft";
        const nextProducts = products.map((item) => item.id === product.id ? { ...item, status: actualStatus } : item);
        setProducts(nextProducts);
        sessionStorage.setItem("productData", JSON.stringify(nextProducts));
        if (result.plan_limited) toast.warning(result.message || "This item stayed in draft because you have reached your plan's listing limit.", { action: { label: "View plans", onClick: () => window.location.assign("/bride/plans") } });
        else toast.success(actualStatus === "Available" ? "Item is now live" : "Item moved to draft");
      } else throw new Error("Update rejected");
    } catch (requestError) { toast.error(getRequestErrorMessage(requestError, "We couldn't update this item. Please try again.")); }
    finally { setUpdating(null); }
  };

  const filters: Filter[] = ["All", "Available", "Draft"];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
        <header><p className="eyebrow">Your collection</p><h1 className="page-title mt-1.5">My items</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">Control which rental items customers can discover.</p></header>

        <section className="mt-7 grid grid-cols-2 gap-3 sm:max-w-lg">
          <MiniStat label="All items" value={products.length} />
          <MiniStat label="Available" value={products.filter((p) => effectiveStatus(p) === "Available").length} tone="success" />
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} className="field-input pl-11" placeholder="Search items or SKU" aria-label="Search items" /></label>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Filter products"><SlidersHorizontal className="mt-2.5 shrink-0 text-muted-foreground" size={18}/>{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${filter === item ? "bg-primary text-white shadow-sm" : "border border-border bg-white text-muted-foreground"}`}>{item}</button>)}</div>
        </div>

        {error && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/15 bg-destructive/5 p-4 text-sm"><span>{error}</span><button onClick={loadProducts} className="font-bold text-destructive">Retry</button></div>}

        {loading ? <ProductLoading /> : filtered.length ? <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:hidden">{filtered.map((product) => <ProductCard key={product.id} product={product} status={effectiveStatus(product)} updating={updating === product.id} onToggle={() => toggleStatus(product)} />)}</div>
          <div className="surface-card mt-5 hidden overflow-hidden xl:block">
            <table className="w-full"><thead><tr className="border-b border-border-light bg-muted/50 text-left text-xs font-bold uppercase tracking-[.1em] text-muted-foreground"><th className="px-6 py-4">Item</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">SKU</th><th className="px-5 py-4">Status</th><th className="px-6 py-4 text-right">Availability</th></tr></thead>
              <tbody>{filtered.map((product) => { const status = effectiveStatus(product); return <tr key={product.id} className="border-b border-border-light last:border-0 hover:bg-muted/30"><td className="px-6 py-4"><div className="flex items-center gap-3"><ProductImage product={product}/><div><p className="font-semibold">{product.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{product.category}</p></div></div></td><td className="px-5 py-4 text-sm font-semibold">LKR {Number(product.price).toLocaleString()}</td><td className="px-5 py-4 text-sm text-muted-foreground">{product.sku || "—"}</td><td className="px-5 py-4"><StatusBadge status={status}/></td><td className="px-6 py-4 text-right"><StatusButton product={product} updating={updating === product.id} onClick={() => toggleStatus(product)}/></td></tr>; })}</tbody>
            </table>
          </div>
        </> : <EmptyState hasQuery={Boolean(query) || filter !== "All"} />}
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value, tone = "default" }: { label: string; value: number; tone?: string }) { return <div className="surface-card min-w-0 p-3.5 sm:p-5"><p className={`text-xl font-bold sm:text-2xl ${tone === "success" ? "text-success" : tone === "gold" ? "text-warning" : ""}`}>{value}</p><p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground sm:text-sm">{label}</p></div>; }
function ProductImage({ product }: { product: Product }) { return <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted text-muted-foreground">{product.thumbnail ? <img src={product.thumbnail} alt="" className="h-full w-full object-cover"/> : <ImageOff size={18}/>}</div>; }
function StatusBadge({ status }: { status: string }) { const classes = status === "Available" ? "bg-success/10 text-success" : status === "Rented" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"; return <span className={`inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${classes}`}><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"/><span className="truncate">{status}</span></span>; }
function StatusButton({ product, updating, onClick, fullWidth = false }: { product: Product; updating: boolean; onClick: () => void; fullWidth?: boolean }) { const rented = product.is_booked === "1"; return <button disabled={rented || updating} onClick={onClick} className={`${fullWidth ? "w-full" : ""} min-h-11 rounded-xl px-4 text-xs font-bold transition active:scale-[.98] disabled:cursor-not-allowed ${rented ? "bg-muted text-muted-foreground/60" : product.status === "Draft" ? "bg-primary text-white" : "border border-border bg-white text-foreground hover:border-primary/30"}`}>{updating ? "Updating…" : rented ? "Currently rented" : product.status === "Draft" ? "Set live" : "Move to draft"}</button>; }
function ProductCard({ product, status, updating, onToggle }: { product: Product; status: string; updating: boolean; onToggle: () => void }) {
  return <article className="surface-card w-full min-w-0 overflow-hidden p-4">
    <div className="flex min-w-0 items-start gap-3">
      <ProductImage product={product}/>
      <div className="min-w-0 flex-1">
        <h2 className="break-words text-sm font-bold leading-5 sm:text-base">{product.name}</h2>
        <p className="mt-1 break-words text-xs text-muted-foreground">{product.category}</p>
        <div className="mt-2"><StatusBadge status={status}/></div>
      </div>
    </div>
    <dl className="my-4 grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(88px,0.65fr)] rounded-xl bg-muted/60 p-3.5">
      <div className="min-w-0 pr-3">
        <dt className="text-[11px] font-semibold text-muted-foreground">Rental price</dt>
        <dd className="mt-1 break-words text-sm font-bold">LKR {Number(product.price).toLocaleString()}</dd>
      </div>
      <div className="min-w-0 border-l border-border pl-3">
        <dt className="text-[11px] font-semibold text-muted-foreground">SKU</dt>
        <dd className="mt-1 break-all text-sm font-bold">{product.sku || "—"}</dd>
      </div>
    </dl>
    <StatusButton product={product} updating={updating} onClick={onToggle} fullWidth/>
  </article>;
}
function EmptyState({ hasQuery }: { hasQuery: boolean }) { return <div className="surface-card mt-5 grid min-h-72 place-items-center px-6 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-primary"><Package size={23}/></span><h2 className="display-font mt-4 text-xl font-bold">{hasQuery ? "No matching items" : "Your collection is empty"}</h2><p className="mt-2 text-sm text-muted-foreground">{hasQuery ? "Try another search or filter." : "Items added on Bridal Arcade will appear here."}</p></div></div>; }
function ProductLoading() { return <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map((item) => <div key={item} className="surface-card p-4"><div className="flex gap-3"><div className="h-12 w-12 animate-pulse rounded-xl bg-muted"/><div className="flex-1"><div className="h-4 w-2/3 animate-pulse rounded bg-muted"/><div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted"/></div></div><div className="mt-4 h-16 animate-pulse rounded-xl bg-muted"/></div>)}</div>; }
function normalizeProduct(value: unknown): Product | null { if (!value || typeof value !== "object") return null; const item = value as Record<string, unknown>; const id = Number(item.id); if (!Number.isInteger(id) || id <= 0) return null; const rawStatus = String(item.status || "Draft").toLowerCase(); const status: Product["status"] = rawStatus === "available" || rawStatus === "publish" ? "Available" : rawStatus === "rented" ? "Rented" : "Draft"; return { id, name: String(item.name || "Untitled item"), price: Number(item.price) || 0, thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : "", is_booked: String(item.is_booked || "0"), sku: typeof item.sku === "string" || typeof item.sku === "number" ? item.sku : "", category: String(item.category || "Uncategorised"), status }; }

import { ArrowLeft, ImageOff, Loader2, PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAdminUserProducts, updateAdminProductStatus, type AdminProduct } from "../api/admin";
import { getRequestErrorMessage } from "../api/portal";
import AdminShell from "../components/AdminShell";

const actions = [
  { label: "Live", value: "publish" as const, active: "bg-emerald-600 text-white border-emerald-600" },
  { label: "Draft", value: "draft" as const, active: "bg-amber-500 text-white border-amber-500" },
  { label: "Trash", value: "trash" as const, active: "bg-red-600 text-white border-red-600" },
];

export default function AdminUserDetail() {
  const { email = "" } = useParams();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<number | null>(null);

  useEffect(() => {
    let live = true; setLoading(true);
    fetchAdminUserProducts(email).then((items) => { if (live) setProducts(items); }).catch((error) => toast.error(getRequestErrorMessage(error, "Unable to load this user's products."))).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [email]);

  const changeStatus = async (product: AdminProduct, status: "publish" | "draft" | "trash") => {
    setChanging(product.id);
    try {
      const response = await updateAdminProductStatus(product.id, status);
      const newStatus = String(response?.new_status ?? response?.status ?? status);
      setProducts((old) => old.map((item) => item.id === product.id ? { ...item, status: newStatus } : item));
      toast.success(`${product.title} is now ${newStatus === "publish" ? "live" : newStatus}.`);
    } catch (error) { toast.error(getRequestErrorMessage(error, "Unable to update this product.")); }
    finally { setChanging(null); }
  };

  return <AdminShell><div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
    <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft size={17} />Back to users</Link>
    <p className="eyebrow mt-7">User products</p><h1 className="page-title mt-1">Product Listings</h1><p className="mt-2 break-all text-sm text-muted-foreground">{email}</p>
    {loading && <div className="mt-10 grid min-h-64 place-items-center rounded-2xl border bg-white text-muted-foreground"><Loader2 className="animate-spin" size={28} /></div>}
    {!loading && !products.length && <div className="surface-card mt-8 px-5 py-16 text-center"><PackageOpen className="mx-auto text-muted-foreground/40" size={40} /><h2 className="mt-4 font-semibold">No products found</h2><p className="mt-1 text-sm text-muted-foreground">This user has no product listings yet.</p></div>}
    {!loading && products.length > 0 && <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className="surface-card overflow-hidden">
      <div className="aspect-[16/10] bg-muted">{product.image ? <img src={product.image} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-muted-foreground/35"><ImageOff size={36} /></span>}</div>
      <div className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="display-font line-clamp-2 text-xl font-bold">{product.title}</h2><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${product.status === "publish" ? "bg-emerald-50 text-emerald-700" : product.status === "trash" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{product.status === "publish" ? "Live" : product.status}</span></div>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/55 p-3 text-sm"><div><p className="text-xs text-muted-foreground">Price</p><p className="mt-1 font-bold">{product.price}</p></div><div><p className="text-xs text-muted-foreground">SKU</p><p className="mt-1 truncate font-bold">{product.sku}</p></div></div>
        <div className="mt-5 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action.value} disabled={changing === product.id} onClick={() => changeStatus(product, action.value)} className={`min-h-10 rounded-xl border px-2 text-xs font-bold transition disabled:opacity-50 ${product.status === action.value ? action.active : "bg-white hover:bg-muted"}`}>{changing === product.id ? "…" : action.label}</button>)}</div>
      </div>
    </article>)}</div>}
  </div></AdminShell>;
}

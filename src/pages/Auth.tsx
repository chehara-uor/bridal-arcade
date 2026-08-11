import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Heart, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import Logo from "../assets/logo.png";
import { getRequestErrorMessage, getSession, loginPartner, prepareForRealLogin, storeUser } from "../api/portal";
import { dashboardFor, normalizeAccountType } from "../auth/account";
import "react-toastify/dist/ReactToastify.css";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    getSession().then((user) => {
      const accountType = normalizeAccountType(user.account_type || sessionStorage.getItem("accountType"));
      storeUser(user, accountType);
      navigate(dashboardFor(accountType), { replace: true });
    }).catch(() => {
      localStorage.removeItem("isAuthenticated");
      sessionStorage.clear();
      setCheckingSession(false);
    });
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next = {
      ...(!formData.email.trim() ? { email: "Enter your username or email address." } : {}),
      ...(!formData.password ? { password: "Enter your password." } : {}),
    };
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      prepareForRealLogin();
      const user = await loginPartner(formData.email.trim(), formData.password);
      const accountType = normalizeAccountType(user.account_type);
      storeUser(user, accountType);
      navigate(dashboardFor(accountType));
    } catch (error) {
      const message = getRequestErrorMessage(error, "We couldn't sign you in. Check your details and try again.");
      toast.error(message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fbf8f4] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#321a27] p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="absolute -right-28 top-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-12 top-36 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute bottom-[-140px] left-[-80px] h-96 w-96 rounded-full bg-[#b9964c]/15 blur-3xl" />
        <Brand />
        <div className="relative my-auto max-w-xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#d5b466]">Built for your bridal journey</p>
          <h1 className="display-font text-5xl font-bold leading-[1.1] xl:text-7xl">Your Bridal Pieces,<br />Beautifully Managed.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/62">List a cherished outfit or grow your bridal business from one calm workspace.</p>
          <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold text-white/80">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5"><ShieldCheck size={17} className="text-[#d5b466]" /> Secure account access</span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5"><Heart size={17} className="text-[#d5b466]" /> Made for bridal sellers</span>
          </div>
        </div>
        <p className="relative text-xs text-white/35">© {new Date().getFullYear()} Bridal Arcade.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10 lg:px-14">
        <div className="w-full max-w-[470px] animate-fade-up">
          <div className="mb-8 lg:hidden"><Brand dark /></div>
          <p className="eyebrow">Welcome back</p>
          <h2 className="display-font mt-2 text-4xl font-bold tracking-tight sm:text-[42px]">Sign in to your portal</h2>
          <p className="mt-3 text-[15px] leading-6 text-muted-foreground">Manage your listings and rental orders.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" aria-busy={loading || checkingSession}>
            <Field label="Username or email" icon={<Mail size={18} />} error={errors.email}>
              <input className="field-input pl-11" name="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: undefined }); }} placeholder="Username or you@example.com" autoComplete="username" required />
            </Field>
            <Field label="Password" icon={<LockKeyhole size={18} />} error={errors.password}>
              <input className="field-input pl-11 pr-12" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: undefined }); }} placeholder="Enter password" autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </Field>
            <div className="flex justify-end"><a href="mailto:info@bridalarcade.lk" className="text-sm font-semibold text-primary hover:underline">Need help signing in?</a></div>
            <button className="primary-button w-full" disabled={loading || checkingSession}>{loading || checkingSession ? "Please wait…" : <>Sign in <ArrowRight size={18} /></>}</button>
          </form>

          <div className="mt-8 rounded-2xl border border-border-light bg-white p-5 text-center shadow-sm">
            <h3 className="display-font text-xl font-bold">New to Bridal Arcade?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">List your bridal outfits or grow your bridal business with us.</p>
            <Link to="/register" className="secondary-button mt-4 w-full">Create an Account <ArrowRight size={17} /></Link>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">By continuing, you agree to Bridal Arcade's partner terms and privacy policy.</p>
        </div>
      </section>
      <ToastContainer position="top-center" autoClose={3500} theme="light" />
    </div>
  );
}

function Brand({ dark = false }: { dark?: boolean }) {
  return <div className="relative flex items-center gap-3"><div className={`h-12 w-12 overflow-hidden rounded-xl bg-white p-1 shadow-xl ${dark ? "border border-border-light" : ""}`}><img src={Logo} alt="Bridal Arcade" className="h-full w-full object-contain" /></div><div><p className="display-font text-xl font-bold">Bridal Arcade</p><p className={`text-[11px] font-bold uppercase tracking-[0.19em] ${dark ? "text-primary/60" : "text-[#d5b466]"}`}>Seller portal</p></div></div>;
}

function Field({ label, icon, children, error }: { label: string; icon: React.ReactNode; children: React.ReactNode; error?: string }) {
  return <label className="block"><span className="field-label">{label}</span><span className="relative block"><span className="pointer-events-none absolute left-4 top-6 z-10 -translate-y-1/2 text-muted-foreground">{icon}</span>{children}</span>{error && <span className="mt-1.5 block text-xs font-semibold text-destructive">{error}</span>}</label>;
}

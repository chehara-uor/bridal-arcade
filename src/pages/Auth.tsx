import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Heart, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import Logo from "../assets/logo.png";
import { registerUser } from "../api/register";
import { getRequestErrorMessage, loginPartner } from "../api/portal";
import "react-toastify/dist/ReactToastify.css";

interface RegisterData { name: string; username: string; email: string; password: string; }
type FormField = "email" | "password" | "name" | "username" | "confirmPassword";
type FormErrors = Partial<Record<FormField, string>>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "", username: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  useEffect(() => {
    const hasSession = Boolean(sessionStorage.getItem("userToken") && sessionStorage.getItem("userID") && sessionStorage.getItem("userEmail"));
    if (localStorage.getItem("isAuthenticated") === "true" && hasSession) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: name === "username" ? value.toLowerCase().replace(/[^a-z0-9_]/g, "") : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const registerOwner = async (data: RegisterData) => {
    await registerUser({ username: data.username.trim(), email: data.email.trim().toLowerCase(), first_name: data.name.trim(), password: data.password, role: "bridal_owner" });
    toast.success("Your partner account is ready. You can sign in now.");
    setFormData({ email: data.email, password: "", name: "", username: "", confirmPassword: "" });
    setIsLogin(true);
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    const email = formData.email.trim();
    if (!email) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";

    if (!formData.password) next.password = "Enter your password.";
    if (!isLogin) {
      if (formData.name.trim().length < 2) next.name = "Enter at least 2 characters.";
      if (formData.username.length < 3) next.username = "Use at least 3 letters, numbers, or underscores.";
      else if (!/^[a-z0-9_]+$/.test(formData.username)) next.username = "Use lowercase letters, numbers, or underscores only.";
      if (formData.password.length < 8) next.password = "Use at least 8 characters for your password.";
      if (!formData.confirmPassword) next.confirmPassword = "Confirm your password.";
      else if (formData.password !== formData.confirmPassword) next.confirmPassword = "The passwords do not match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const data = await loginPartner(formData.email.trim().toLowerCase(), formData.password);
        sessionStorage.clear();
        sessionStorage.setItem("userToken", data.token);
        sessionStorage.setItem("userID", String(data.user_id));
        sessionStorage.setItem("userName", data.firstname?.trim() || "Partner");
        sessionStorage.setItem("userEmail", formData.email.trim().toLowerCase());
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");
      } else {
        await registerOwner(formData);
      }
    } catch (error) {
      const fallback = isLogin ? "We couldn't sign you in. Check your details and try again." : "We couldn't create your account. Please review your details and try again.";
      const message = getRequestErrorMessage(error, fallback);
      toast.error(isLogin && message.includes("not authorized") ? "That email or password is incorrect." : message);
    } finally { setLoading(false); }
  };

  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#fbf8f4] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#321a27] p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="absolute -right-28 top-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-12 top-36 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute bottom-[-140px] left-[-80px] h-96 w-96 rounded-full bg-[#b9964c]/15 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-xl bg-white p-1 shadow-xl"><img src={Logo} alt="Bridal Arcade" className="h-full w-full object-contain" /></div>
          <div><p className="display-font text-xl font-bold">Bridal Arcade</p><p className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#d5b466]">Partner portal</p></div>
        </div>
        <div className="relative my-auto max-w-xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#d5b466]">Built for your bridal business</p>
          <h1 className="display-font text-5xl font-bold leading-[1.1] xl:text-7xl">Your Rentals,<br />Beautifully Managed.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/62">Keep your collection available, follow every booking, and understand your earnings from one calm workspace.</p>
          <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold text-white/80">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5"><ShieldCheck size={17} className="text-[#d5b466]" /> Secure partner access</span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5"><Heart size={17} className="text-[#d5b466]" /> Made for bridal vendors</span>
          </div>
        </div>
        <p className="relative text-xs text-white/35">© {new Date().getFullYear()} Bridal Arcade. Partner operations.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10 lg:px-14">
        <div className="w-full max-w-[470px] animate-fade-up">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="h-11 w-11 overflow-hidden rounded-xl border border-border-light bg-white p-1 shadow-sm"><img src={Logo} alt="Bridal Arcade" className="h-full w-full object-contain" /></div>
            <div><p className="display-font text-lg font-bold">Bridal Arcade</p><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-primary/60">Partner portal</p></div>
          </div>

          <p className="eyebrow">{isLogin ? "Welcome back" : "Become a partner"}</p>
          <h2 className="display-font mt-2 text-4xl font-bold tracking-tight sm:text-[42px]">{isLogin ? "Sign in to your portal" : "Create your account"}</h2>
          <p className="mt-3 text-[15px] leading-6 text-muted-foreground">{isLogin ? "Manage your listings and rental orders." : "Start managing your Bridal Arcade rental collection."}</p>

          <div className="mt-7 grid grid-cols-2 rounded-xl bg-muted p-1" role="tablist">
            <button type="button" onClick={() => switchMode(true)} className={`min-h-11 rounded-lg text-sm font-semibold transition ${isLogin ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>Sign in</button>
            <button type="button" onClick={() => switchMode(false)} className={`min-h-11 rounded-lg text-sm font-semibold transition ${!isLogin ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {!isLogin && <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" icon={<UserRound size={18} />} error={errors.name}><input className="field-input pl-11" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" autoComplete="given-name" aria-invalid={Boolean(errors.name)} required /></Field>
              <Field label="Username" icon={<UserRound size={18} />} error={errors.username}><input className="field-input pl-11" name="username" value={formData.username} onChange={handleChange} placeholder="your_name" autoComplete="username" aria-invalid={Boolean(errors.username)} required /></Field>
            </div>}
            <Field label="Email address" icon={<Mail size={18} />} error={errors.email}><input className="field-input pl-11" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} required /></Field>
            <div className={!isLogin ? "grid gap-5 sm:grid-cols-2" : ""}>
              <Field label="Password" icon={<LockKeyhole size={18} />} error={errors.password}>
                <input className="field-input pl-11 pr-12" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder={isLogin ? "Enter password" : "At least 8 characters"} autoComplete={isLogin ? "current-password" : "new-password"} aria-invalid={Boolean(errors.password)} required />
                <VisibilityButton shown={showPassword} onClick={() => setShowPassword(!showPassword)} />
              </Field>
              {!isLogin && <Field label="Confirm password" icon={<LockKeyhole size={18} />} extraClass="mt-5 sm:mt-0" error={errors.confirmPassword}>
                <input className="field-input pl-11 pr-12" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} required />
                <VisibilityButton shown={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
              </Field>}
            </div>
            {isLogin && <div className="flex justify-end"><a href="mailto:info@bridalarcade.lk" className="text-sm font-semibold text-primary hover:underline">Need help signing in?</a></div>}
            <button className="primary-button w-full" disabled={loading}>{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> Please wait</> : <>{isLogin ? "Sign in" : "Create partner account"}<ArrowRight size={18} /></>}</button>
          </form>
          <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">By continuing, you agree to Bridal Arcade's partner terms and privacy policy.</p>
        </div>
      </section>
      <ToastContainer position="top-center" autoClose={3500} theme="light" />
    </div>
  );
}

function Field({ label, icon, children, extraClass = "", error }: { label: string; icon: React.ReactNode; children: React.ReactNode; extraClass?: string; error?: string }) {
  return <label className={`block ${extraClass}`}><span className="field-label">{label}</span><span className="relative block"><span className="pointer-events-none absolute left-4 top-6 z-10 -translate-y-1/2 text-muted-foreground">{icon}</span>{children}</span>{error && <span className="mt-1.5 block text-xs font-semibold text-destructive">{error}</span>}</label>;
}

function VisibilityButton({ shown, onClick }: { shown: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label={shown ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">{shown ? <EyeOff size={18} /> : <Eye size={18} />}</button>;
}

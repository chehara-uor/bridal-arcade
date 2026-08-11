import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Logo from "../assets/logo.png";
import { registerUser } from "../api/register";
import { getRequestErrorMessage, loginPartner, prepareForRealLogin, storeUser } from "../api/portal";
import "react-toastify/dist/ReactToastify.css";

type FormField = "email" | "password" | "name" | "phone" | "confirmPassword";
type FormErrors = Partial<Record<FormField, string>>;

export default function BrideRegistration() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "", phone: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (formData.name.trim().length < 2) next.name = "Enter at least 2 characters.";
    if (!formData.phone.trim()) next.phone = "Enter your phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) next.email = "Enter a valid email address.";
    if (formData.password.length < 8) next.password = "Use at least 8 characters for your password.";
    if (formData.password !== formData.confirmPassword) next.confirmPassword = "The passwords do not match.";
    setErrors(next);
    return !Object.keys(next).length;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser({ email: formData.email.trim().toLowerCase(), first_name: formData.name.trim(), phone: formData.phone.trim(), password: formData.password, account_type: "individual" });
      prepareForRealLogin();
      const user = await loginPartner(formData.email.trim().toLowerCase(), formData.password);
      storeUser(user, "individual");
      toast.success("Your account is ready.");
      navigate("/bride/dashboard", { replace: true });
    } catch (error) {
      toast.error(getRequestErrorMessage(error, "We couldn't create your account. Please review your details and try again."));
    } finally { setLoading(false); }
  };

  return <RegistrationFrame title="Create your bride account" subtitle="List your own bridal outfit for rent or sale.">
    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2"><Field label="First name" icon={<UserRound size={18}/>} error={errors.name}><input className="field-input pl-11" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" autoComplete="given-name" required /></Field><Field label="Phone" icon={<Phone size={18}/>} error={errors.phone}><input className="field-input pl-11" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Your phone number" autoComplete="tel" required /></Field></div>
      <Field label="Email address" icon={<Mail size={18}/>} error={errors.email}><input className="field-input pl-11" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required /></Field>
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Password" icon={<LockKeyhole size={18}/>} error={errors.password}><input className="field-input pl-11 pr-12" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters" autoComplete="new-password" required /><Visibility shown={showPassword} onClick={() => setShowPassword(!showPassword)}/></Field><Field label="Confirm password" icon={<LockKeyhole size={18}/>} error={errors.confirmPassword}><input className="field-input pl-11 pr-12" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" autoComplete="new-password" required /><Visibility shown={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)}/></Field></div>
      <button className="primary-button w-full" disabled={loading}>{loading ? "Creating account…" : <>Create bride account <ArrowRight size={18}/></>}</button>
    </form>
  </RegistrationFrame>;
}

export function RegistrationFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#fbf8f4] px-5 py-7 sm:px-8 sm:py-10"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between gap-4"><Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft size={17}/>Choose account type</Link><Link to="/" className="flex items-center gap-2"><img src={Logo} alt="Bridal Arcade" className="h-10 w-10 rounded-xl bg-white p-1 shadow"/><span className="display-font hidden font-bold sm:block">Bridal Arcade</span></Link></div><section className="surface-card mt-8 p-5 sm:p-8 lg:p-10"><p className="eyebrow">Join Bridal Arcade</p><h1 className="display-font mt-2 text-3xl font-bold sm:text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{subtitle}</p>{children}</section><p className="mt-6 text-center text-sm text-muted-foreground">Already registered? <Link to="/" className="font-bold text-primary hover:underline">Sign in</Link></p></div><ToastContainer position="top-center" autoClose={3500} theme="light"/></main>;
}

export function Field({ label, icon, children, error }: { label: string; icon?: React.ReactNode; children: React.ReactNode; error?: string }) { return <label className="block"><span className="field-label">{label}</span><span className="relative block">{icon && <span className="pointer-events-none absolute left-4 top-6 z-10 -translate-y-1/2 text-muted-foreground">{icon}</span>}{children}</span>{error && <span className="mt-1.5 block text-xs font-semibold text-destructive">{error}</span>}</label>; }
function Visibility({ shown, onClick }: { shown: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} aria-label={shown ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted">{shown ? <EyeOff size={18}/> : <Eye size={18}/>}</button>; }

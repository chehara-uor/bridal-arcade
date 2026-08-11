import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, ImagePlus, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Field, RegistrationFrame } from "./BrideRegistration";
import { getRequestErrorMessage, storeUser, type PortalUser } from "../api/portal";
import { registerVendorAccount, registerVendorProfile, sendVendorOtp, SIMULATED_VENDOR_OTP, verifyVendorOtp, type VendorAccountData } from "../api/vendorRegistration";

export const SRI_LANKAN_DISTRICTS = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];
export const VENDOR_OFFERS = ["Bridal Sarees", "Kandyan Bridal Sarees", "Made-up Kandyan", "Modern Kandyan", "Lehengas", "Bridal Frocks", "Muslim Bridal Wear", "Bridal Rentals", "Bridal Outfit Sales", "Custom Bridal Saree Making", "Custom Bridal Outfit Designing", "Alterations"];

const initial = { name: "", email: "", phone: "", password: "", confirmPassword: "", business_name: "", about: "", district: "", instagram: "", opening_hours: "" };

export default function VendorRegistration() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initial);
  const [otp, setOtp] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [offers, setOffers] = useState<string[]>([]);
  const [createdUser, setCreatedUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const preview = useMemo(() => coverImage ? URL.createObjectURL(coverImage) : "", [coverImage]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };
  const toggle = (value: string, values: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  const accountData = (): VendorAccountData => ({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), password: form.password, account_type: "business" });

  const requestOtp = async () => {
    if (form.name.trim().length < 2) return setError("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError("Enter a valid email address.");
    if (!form.phone.trim()) return setError("Enter your phone number.");
    if (form.password.length < 8) return setError("Use at least 8 characters for your password.");
    if (form.password !== form.confirmPassword) return setError("The passwords do not match.");
    setLoading(true);
    try { await sendVendorOtp(form.email.trim()); setOtp(""); setStep(2); setError(""); }
    catch { setError("We couldn't send the verification code. Please try again."); }
    finally { setLoading(false); }
  };

  const verifyAndCreateUser = async () => {
    if (otp.length !== 6) return setError("Enter the 6-digit verification code.");
    setLoading(true); setError("");
    try {
      if (!await verifyVendorOtp(otp)) { setError("That verification code is incorrect."); return; }
      const result = await registerVendorAccount(accountData());
      setCreatedUser(result.user);
      storeUser(result.user, "business");
      setStep(3);
      toast.success("Email verified and WordPress user created.");
    } catch (requestError) { setError(getRequestErrorMessage(requestError, "We couldn't create your WordPress user. Please try again.")); }
    finally { setLoading(false); }
  };

  const continueToServices = () => {
    if (!form.business_name.trim()) return setError("Enter your business name.");
    if (!form.about.trim()) return setError("Tell brides about your business.");
    if (!coverImage) return setError("Choose a cover image.");
    if (!form.district) return setError("Choose your district.");
    setError(""); setStep(4);
  };

  const createProfile = async () => {
    if (!areas.length) return setError("Choose at least one area served.");
    if (!offers.length) return setError("Choose at least one product or service you offer.");
    if (!coverImage) return setError("Your cover image is missing. Return to the previous step.");
    const userId = createdUser?.id || localStorage.getItem("vendorUserID");
    if (!userId) return setError("Your WordPress user ID is missing. Please restart registration.");
    setLoading(true); setError("");
    try {
      await registerVendorProfile(userId, { business_name: form.business_name.trim(), cover_image: coverImage, about: form.about.trim(), district: form.district, areas_served: areas, phone: form.phone.trim(), instagram: form.instagram.trim() || undefined, opening_hours: form.opening_hours.trim() || undefined, offer: offers, plan: "free" });
      toast.success("Your vendor profile is ready.");
      navigate("/vendor/dashboard", { replace: true });
    } catch { setError("We couldn't create your vendor profile. Please try again."); }
    finally { setLoading(false); }
  };

  return <RegistrationFrame title="Create your shop account" subtitle="Complete four quick steps to start listing your bridal collection.">
    <StepIndicator current={step}/>

    {step === 1 && <section className="mt-8"><FormSection title="Account details"><div className="grid gap-5 sm:grid-cols-2"><Field label="Name" icon={<UserRound size={18}/>}><input className="field-input pl-11" name="name" value={form.name} onChange={update} autoComplete="name" required /></Field><Field label="Email" icon={<Mail size={18}/>}><input className="field-input pl-11" type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></Field><Field label="Phone" icon={<Phone size={18}/>}><input className="field-input pl-11" type="tel" name="phone" value={form.phone} onChange={update} autoComplete="tel" required /></Field><div className="hidden sm:block"/><Field label="Password" icon={<LockKeyhole size={18}/>}><input className="field-input pl-11" type="password" name="password" value={form.password} onChange={update} minLength={8} autoComplete="new-password" required /></Field><Field label="Confirm password" icon={<LockKeyhole size={18}/>}><input className="field-input pl-11" type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} minLength={8} autoComplete="new-password" required /></Field></div></FormSection><StepError message={error}/><button type="button" onClick={requestOtp} className="primary-button mt-6 w-full" disabled={loading}>{loading ? "Sending code…" : <>Next <ArrowRight size={18}/></>}</button></section>}

    {step === 2 && <section className="mx-auto mt-9 max-w-md text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary"><ShieldCheck/></span><h2 className="display-font mt-5 text-2xl font-bold">Verify your email</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Enter the code sent to <strong className="text-foreground">{form.email}</strong>.</p><div className="mt-5 rounded-xl border border-[#d5b466]/30 bg-[#fbf5e8] p-3 text-sm text-[#6c5420]">Simulation code: <strong className="tracking-[.18em]">{SIMULATED_VENDOR_OTP}</strong></div><input value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} inputMode="numeric" autoComplete="one-time-code" aria-label="Verification code" className="mt-5 h-14 w-full rounded-xl border border-input-border bg-white text-center text-2xl font-bold tracking-[.4em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="000000"/><StepError message={error}/><button type="button" onClick={verifyAndCreateUser} className="primary-button mt-5 w-full" disabled={loading}>{loading ? "Creating WordPress user…" : <>Verify & Continue <ArrowRight size={18}/></>}</button><div className="mt-4 flex justify-center gap-5 text-sm font-semibold"><button type="button" onClick={() => { setStep(1); setError(""); }} className="text-muted-foreground hover:text-primary">Change details</button><button type="button" onClick={requestOtp} disabled={loading} className="text-primary hover:underline">Resend code</button></div></section>}

    {step === 3 && <section className="mt-8"><FormSection title="Business profile"><div className="space-y-5"><Field label="Business name" icon={<Building2 size={18}/>}><input className="field-input pl-11" name="business_name" value={form.business_name} onChange={update} required /></Field><Field label="About"><textarea className="min-h-32 w-full rounded-xl border border-input-border bg-white px-4 py-3 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" name="about" value={form.about} onChange={update} placeholder="Tell brides about your shop, style and services." required /></Field><Field label="Cover image"><label className="flex min-h-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-accent/35 text-center transition hover:bg-accent/60">{preview ? <img src={preview} alt="Cover preview" className="h-44 w-full object-cover"/> : <span className="p-5 text-sm font-semibold text-primary"><ImagePlus className="mx-auto mb-2"/>Choose a JPG, PNG or WebP image</span>}<input className="sr-only" type="file" accept="image/*" onChange={(event) => { setCoverImage(event.target.files?.[0] || null); setError(""); }} required /></label></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="District"><select className="field-input" name="district" value={form.district} onChange={update} required><option value="">Choose district</option>{SRI_LANKAN_DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select></Field><Field label="Opening hours (optional)"><input className="field-input" name="opening_hours" value={form.opening_hours} onChange={update} placeholder="Mon - Sat, 9.00 AM - 6.00 PM" /></Field></div><Field label="Instagram (optional)"><input className="field-input" type="url" name="instagram" value={form.instagram} onChange={update} placeholder="https://instagram.com/yourshop" /></Field></div></FormSection><StepError message={error}/><StepButtons next={continueToServices} nextLabel="Next" loading={loading}/></section>}

    {step === 4 && <section className="mt-8 space-y-7"><FormSection title="Areas served"><CheckboxGrid options={SRI_LANKAN_DISTRICTS} values={areas} onToggle={(value) => toggle(value, areas, setAreas)} /></FormSection><FormSection title="What do you offer?"><CheckboxGrid options={VENDOR_OFFERS} values={offers} onToggle={(value) => toggle(value, offers, setOffers)} /></FormSection><FormSection title="Your plan"><div className="relative rounded-2xl border-2 border-primary bg-primary/5 p-5"><span className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-primary text-white"><Check size={16}/></span><p className="text-xs font-bold uppercase tracking-[.14em] text-primary/65">Automatically selected</p><h3 className="display-font mt-2 text-2xl font-bold">Free Plan</h3><p className="mt-2 text-sm text-muted-foreground">Start building your Bridal Arcade shop profile at no cost.</p></div></FormSection><StepError message={error}/><StepButtons back={() => { setStep(3); setError(""); }} next={createProfile} nextLabel="Create Profile" loading={loading}/></section>}
  </RegistrationFrame>;
}

function StepIndicator({ current }: { current: number }) { const labels = ["Account", "Verify", "Business", "Services"]; return <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Registration progress">{labels.map((label, index) => { const number = index + 1; const active = number <= current; return <li key={label} className="min-w-0"><div className={`h-1.5 rounded-full ${active ? "bg-primary" : "bg-muted-dark"}`}/><p className={`mt-2 truncate text-center text-[10px] font-bold uppercase tracking-wide sm:text-xs ${number === current ? "text-primary" : "text-muted-foreground"}`}>{number}. {label}</p></li>; })}</ol>; }
function FormSection({ title, children }: { title: string; children: React.ReactNode }) { return <fieldset><legend className="display-font mb-4 text-xl font-bold">{title}</legend>{children}</fieldset>; }
function CheckboxGrid({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (value: string) => void }) { return <div className="grid gap-2 sm:grid-cols-2">{options.map((option) => <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${values.includes(option) ? "border-primary/35 bg-primary/5 text-primary" : "border-border bg-white"}`}><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#67304b]" checked={values.includes(option)} onChange={() => onToggle(option)}/><span className="font-semibold">{option}</span></label>)}</div>; }
function StepError({ message }: { message: string }) { return message ? <p role="alert" className="mt-5 rounded-xl border border-destructive/15 bg-destructive/5 p-3 text-sm font-semibold text-destructive">{message}</p> : null; }
function StepButtons({ back, next, nextLabel, loading }: { back?: () => void; next: () => void; nextLabel: string; loading: boolean }) { return <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">{back && <button type="button" onClick={back} className="secondary-button sm:w-40"><ArrowLeft size={17}/>Back</button>}<button type="button" onClick={next} className="primary-button flex-1" disabled={loading}>{loading ? "Please wait…" : <>{nextLabel}<ArrowRight size={18}/></>}</button></div>; }

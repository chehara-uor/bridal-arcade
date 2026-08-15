import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { getRequestErrorMessage } from "../api/portal";
import { isExpiredPasswordReset, setResetPassword, verifyPasswordResetAccount, verifyPasswordResetOtp, type PasswordResetVerification } from "../api/passwordReset";

type Step = 1 | 2 | 3;
type Errors = Partial<Record<"email" | "phone" | "otp" | "newPassword" | "confirmPassword" | "form", string>>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ email: "", phone: "", otp: "", newPassword: "", confirmPassword: "" });
  const [verification, setVerification] = useState<PasswordResetVerification | null>(null);
  const [otpProof, setOtpProof] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => navigate("/", { replace: true }), 1800);
    return () => window.clearTimeout(timeout);
  }, [navigate, success]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const startOver = (message?: string) => {
    setVerification(null);
    setOtpProof("");
    setForm((current) => ({ ...current, otp: "", newPassword: "", confirmPassword: "" }));
    setErrors(message ? { form: message } : {});
    setStep(1);
  };

  const sendCode = async () => {
    const next: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!/^(?:\+94|0)7\d{8}$/.test(form.phone.replace(/[\s()-]/g, ""))) next.phone = "Enter a valid Sri Lankan mobile number.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const result = await verifyPasswordResetAccount(form.email, form.phone);
      setVerification(result);
      setOtpProof("");
      setForm((current) => ({ ...current, otp: "" }));
      setErrors({});
      setStep(2);
    } catch (error) {
      setErrors({ form: getRequestErrorMessage(error, "No account found with that email and mobile number.") });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verification) return startOver("Please verify your account again.");
    if (form.otp.length !== 6) return setErrors({ otp: "Enter the complete six-digit code." });
    setLoading(true);
    try {
      const proof = await verifyPasswordResetOtp(verification, form.otp);
      setOtpProof(proof);
      setErrors({});
      setStep(3);
    } catch (error) {
      setErrors({ form: getRequestErrorMessage(error, "The verification code is invalid or expired.") });
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async () => {
    const next: Errors = {};
    if (form.newPassword.length < 8) next.newPassword = "Use at least 8 characters.";
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = "The passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    if (!verification || !otpProof) return startOver("Your verification has expired. Please verify your account again.");
    setLoading(true);
    try {
      await setResetPassword(verification, otpProof, form.newPassword, form.confirmPassword);
      setVerification(null);
      setOtpProof("");
      setSuccess(true);
    } catch (error) {
      if (isExpiredPasswordReset(error)) {
        startOver("Your verification has expired. Please verify your account again.");
        return;
      }
      setErrors({ form: getRequestErrorMessage(error, "We couldn't update your password.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf8f4] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-[#321a27] p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -right-6 top-36 h-72 w-72 rounded-full border border-white/10" />
        <Link to="/" className="relative flex items-center gap-3">
          <span className="h-12 w-12 overflow-hidden rounded-xl bg-white p-1 shadow-xl"><img src={Logo} alt="Bridal Arcade" className="h-full w-full object-contain" /></span>
          <span><span className="display-font block text-xl font-bold">Bridal Arcade</span><span className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#d5b466]">Seller portal</span></span>
        </Link>
        <div className="relative my-auto max-w-md">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-[#d5b466]"><ShieldCheck size={28} /></span>
          <h1 className="display-font mt-6 text-5xl font-bold leading-tight">Securely recover your account.</h1>
          <p className="mt-5 leading-7 text-white/65">We verify both your account details and your phone before allowing a new password.</p>
        </div>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10 lg:px-14">
        <div className="w-full max-w-[520px] animate-fade-up">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-3"><img src={Logo} alt="Bridal Arcade" className="h-11 w-11 rounded-xl bg-white p-1 shadow" /><span className="display-font text-xl font-bold">Bridal Arcade</span></Link>
          </div>
          <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft size={17} /> Back to sign in</Link>

          {!success && <Progress step={step} />}

          {success ? (
            <section className="text-center" aria-live="polite">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={38} /></span>
              <h2 className="display-font mt-6 text-4xl font-bold">Password updated</h2>
              <p className="mt-3 text-muted-foreground">Your new password is ready. Taking you back to sign in…</p>
              <Link to="/" className="primary-button mt-7 w-full">Continue to sign in <ArrowRight size={18} /></Link>
            </section>
          ) : step === 1 ? (
            <section>
              <p className="eyebrow">Reset password</p>
              <h2 className="display-font mt-2 text-4xl font-bold">Find your account</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter the email and mobile number registered with Bridal Arcade.</p>
              <div className="mt-8 space-y-5">
                <Field label="Email address" icon={<Mail size={18} />} error={errors.email}><input className="field-input pl-11" type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" /></Field>
                <Field label="Mobile number" icon={<Phone size={18} />} error={errors.phone}><input className="field-input pl-11" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="07X XXX XXXX" /></Field>
                <FormError message={errors.form} />
                <button type="button" className="primary-button w-full" disabled={loading} onClick={sendCode}>{loading ? "Verifying and sending…" : "Send verification code"}<ArrowRight size={18} /></button>
              </div>
            </section>
          ) : step === 2 ? (
            <section>
              <p className="eyebrow">Phone verification</p>
              <h2 className="display-font mt-2 text-4xl font-bold">Enter your code</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">We sent a six-digit code to <strong className="text-foreground">{form.phone}</strong>. It expires in 5 minutes.</p>
              <div className="mt-8">
                <input className="h-16 w-full rounded-xl border border-input-border bg-white text-center text-2xl font-bold tracking-[0.45em] outline-none transition placeholder:text-muted-foreground/35 focus:border-primary focus:ring-4 focus:ring-primary/10" value={form.otp} onChange={(event) => update("otp", event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" aria-label="Six-digit verification code" autoFocus />
                {errors.otp && <p className="mt-2 text-xs font-semibold text-destructive">{errors.otp}</p>}
                <FormError message={errors.form} />
                <button type="button" className="primary-button mt-5 w-full" disabled={loading} onClick={verifyCode}>{loading ? "Verifying…" : "Verify code"}<ArrowRight size={18} /></button>
                <div className="mt-5 flex items-center justify-center gap-6 text-sm font-semibold"><button type="button" className="text-muted-foreground hover:text-primary" onClick={() => startOver()}>Change details</button><button type="button" className="text-primary hover:underline disabled:opacity-50" disabled={loading} onClick={sendCode}>Resend code</button></div>
              </div>
            </section>
          ) : (
            <section>
              <p className="eyebrow">New password</p>
              <h2 className="display-font mt-2 text-4xl font-bold">Create a new password</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Use at least eight characters. Your verification link expires 15 minutes after account verification.</p>
              <div className="mt-8 space-y-5">
                <Field label="New password" icon={<LockKeyhole size={18} />} error={errors.newPassword}><input className="field-input pl-11 pr-12" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.newPassword} onChange={(event) => update("newPassword", event.target.value)} /><Visibility shown={showPassword} toggle={() => setShowPassword((shown) => !shown)} /></Field>
                <Field label="Confirm password" icon={<LockKeyhole size={18} />} error={errors.confirmPassword}><input className="field-input pl-11 pr-12" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} /><Visibility shown={showConfirmPassword} toggle={() => setShowConfirmPassword((shown) => !shown)} /></Field>
                <FormError message={errors.form} />
                <button type="button" className="primary-button w-full" disabled={loading} onClick={savePassword}>{loading ? "Updating password…" : "Set new password"}<ArrowRight size={18} /></button>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function Progress({ step }: { step: Step }) {
  return <div className="mb-8 grid grid-cols-3 gap-2" aria-label={`Step ${step} of 3`}>{[1, 2, 3].map((item) => <span key={item} className={`h-1.5 rounded-full transition ${item <= step ? "bg-primary" : "bg-muted-dark"}`} />)}</div>;
}

function Field({ label, icon, children, error }: { label: string; icon: React.ReactNode; children: React.ReactNode; error?: string }) {
  return <label className="block"><span className="field-label">{label}</span><span className="relative block"><span className="pointer-events-none absolute left-4 top-6 z-10 -translate-y-1/2 text-muted-foreground">{icon}</span>{children}</span>{error && <span className="mt-1.5 block text-xs font-semibold text-destructive">{error}</span>}</label>;
}

function Visibility({ shown, toggle }: { shown: boolean; toggle: () => void }) {
  return <button type="button" onClick={toggle} aria-label={shown ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted">{shown ? <EyeOff size={18} /> : <Eye size={18} />}</button>;
}

function FormError({ message }: { message?: string }) {
  return message ? <p className="rounded-xl bg-destructive/5 p-3 text-sm font-semibold text-destructive" role="alert">{message}</p> : null;
}

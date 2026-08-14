import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Logo from "../assets/logo.png";
import { getRequestErrorMessage, storeUser } from "../api/portal";
import { sendWidgetOtp, verifyOtpAndRegister } from "../api/widgetOtp";
import "react-toastify/dist/ReactToastify.css";

type FormField = "email" | "password" | "name" | "phone" | "confirmPassword";
type FormErrors = Partial<Record<FormField | "form" | "otp", string>>;

export default function BrideRegistration() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [otp, setOtp] = useState("");
  const [challenge, setChallenge] = useState("");
  const navigate = useNavigate();
  const change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      form: undefined,
    }));
  };
  const sendOtp = async () => {
    const next: FormErrors = {};
    if (form.name.trim().length < 2) next.name = "Enter at least 2 characters.";
    if (!/^(?:\+94|0)7\d{8}$/.test(form.phone.replace(/\s/g, "")))
      next.phone = "Enter a valid Sri Lankan mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword)
      next.confirmPassword = "The passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const token = await sendWidgetOtp(form.email.trim(), form.phone.trim());
      if (!token) throw new Error("Missing challenge");
      setChallenge(token);
      setOtp("");
      setStep(2);
    } catch (error) {
      setErrors({
        form: getRequestErrorMessage(
          error,
          "We couldn't send the verification code.",
        ),
      });
    } finally {
      setLoading(false);
    }
  };
  const verify = async () => {
    if (otp.length !== 6)
      return setErrors({ otp: "Enter the complete six-digit code." });
    setLoading(true);
    setErrors({});
    try {
      const user = await verifyOtpAndRegister({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        otp,
        challenge,
      });
      storeUser(user, "individual");
      toast.success("Phone verified. Your account is ready.");
      navigate("/bride/dashboard", { replace: true });
    } catch (error) {
      setErrors({
        form: getRequestErrorMessage(error, "The code is invalid or expired."),
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <RegistrationFrame
      title="Create your bride account"
      subtitle="List your own bridal outfit for rent or sale."
    >
      <div className="mt-7 grid grid-cols-2 gap-2">
        <span className="h-1.5 rounded-full bg-primary" />
        <span
          className={`h-1.5 rounded-full ${step === 2 ? "bg-primary" : "bg-muted-dark"}`}
        />
      </div>
      {step === 1 && (
        <section className="mt-7 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="First name"
              icon={<UserRound size={18} />}
              error={errors.name}
            >
              <input
                className="field-input pl-11"
                name="name"
                value={form.name}
                onChange={change}
              />
            </Field>
            <Field
              label="Phone"
              icon={<Phone size={18} />}
              error={errors.phone}
            >
              <input
                className="field-input pl-11"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={change}
              />
            </Field>
          </div>
          <Field
            label="Email address"
            icon={<Mail size={18} />}
            error={errors.email}
          >
            <input
              className="field-input pl-11"
              type="email"
              name="email"
              value={form.email}
              onChange={change}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Password"
              icon={<LockKeyhole size={18} />}
              error={errors.password}
            >
              <input
                className="field-input pl-11 pr-12"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={change}
              />
              <Visibility
                shown={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              />
            </Field>
            <Field
              label="Confirm password"
              icon={<LockKeyhole size={18} />}
              error={errors.confirmPassword}
            >
              <input
                className="field-input pl-11 pr-12"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={change}
              />
              <Visibility
                shown={showConfirmPassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </Field>
          </div>
          <FormError message={errors.form} />
          <button
            type="button"
            onClick={sendOtp}
            disabled={loading}
            className="primary-button w-full"
          >
            {loading ? "Sending code…" : "Continue to verification"}
            <ArrowRight size={18} />
          </button>
        </section>
      )}
      {step === 2 && (
        <section className="mx-auto mt-9 max-w-md text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-primary">
            <ShieldCheck />
          </span>
          <h2 className="display-font mt-5 text-2xl font-bold">
            Verify your phone
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Enter the SMS code sent to <strong>{form.phone}</strong>.
          </p>
          <input
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
              setErrors({});
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            className="mt-6 h-14 w-full rounded-xl border bg-white text-center text-2xl font-bold tracking-[.4em]"
            placeholder="000000"
          />
          <FormError message={errors.otp || errors.form} />
          <button
            type="button"
            onClick={verify}
            disabled={loading}
            className="primary-button mt-5 w-full"
          >
            {loading ? "Verifying…" : "Verify & create account"}
            <ArrowRight size={18} />
          </button>
          <div className="mt-4 flex justify-center gap-5 text-sm font-semibold">
            <button
              onClick={() => setStep(1)}
              className="text-muted-foreground"
            >
              Change details
            </button>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="text-primary"
            >
              Resend code
            </button>
          </div>
        </section>
      )}
    </RegistrationFrame>
  );
}
export function RegistrationFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#2d1723] px-5 py-7 sm:px-8 sm:py-10">
      <div className="absolute inset-0 bg-[url('/bb-bg.webp')] bg-cover bg-center opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#27131f]/70 via-[#321a27]/75 to-[#24101b]/95" />

      <div className="relative mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Choose account type
          </Link>
          <Link to="/">
            <img
              src={Logo}
              alt="Bridal Arcade"
              className="h-11 w-11 rounded-xl bg-white p-1 shadow-xl"
            />
          </Link>
        </div>
        <section className="mt-8 rounded-[28px] border border-white/12 bg-white p-5 text-black shadow-[0_20px_60px_rgba(12,5,10,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
          <p className="eyebrow text-[#d5b466]">Join Bridal Arcade</p>
          <h1 className="display-font mt-2 text-3xl font-bold text-[#7a2352] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-black">{subtitle}</p>
          {children}
        </section>
      </div>
      <ToastContainer position="top-center" />
    </main>
  );
}
export function Field({
  label,
  icon,
  children,
  error,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-black">{label}</span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-6 z-10 -translate-y-1/2 text-[#7a2352]">
            {icon}
          </span>
        )}
        {children}
      </span>
      {error && (
        <span className="mt-1.5 block text-xs font-semibold text-[#868686]">
          {error}
        </span>
      )}
    </label>
  );
}
function Visibility({
  shown,
  onClick,
}: {
  shown: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center"
    >
      {shown ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}
function FormError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-4 rounded-xl bg-destructive/5 p-3 text-sm font-semibold text-destructive">
      {message}
    </p>
  ) : null;
}

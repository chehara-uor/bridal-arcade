import { Check, CircleHelp, LockKeyhole, LogOut, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { logoutPartner } from "../api/portal";

export default function MyAccount() {
  const name = sessionStorage.getItem("userName")?.trim() || "Bridal Arcade Partner";
  const email = sessionStorage.getItem("userEmail")?.trim() || "Email unavailable";
  const navigate = useNavigate();

  const logout = async () => {
    await logoutPartner();
    navigate("/", { replace: true });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[920px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
        <header>
          <p className="eyebrow">Partner settings</p>
          <h1 className="page-title mt-1.5">My account</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Review your Bridal Arcade partner profile.</p>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_.9fr]">
          <section className="surface-card overflow-hidden">
            <div className="h-28 bg-[#321a27] sm:h-32" />
            <div className="px-5 pb-6 sm:px-7 sm:pb-7">
              <div className="-mt-11 grid h-[88px] w-[88px] place-items-center rounded-2xl border-4 border-white bg-[#d5b466] text-3xl font-bold text-[#321a27] shadow-lg">
                {name.charAt(0).toUpperCase()}
              </div>
              <h2 className="display-font mt-5 text-2xl font-bold">{name}</h2>
              <p className="mt-2 flex items-center gap-2 break-all text-sm text-muted-foreground"><Mail size={15} className="shrink-0" />{email}</p>
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-success/8 p-3 text-xs font-semibold text-success">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-success text-white"><Check size={13} /></span>
                Active Bridal Arcade partner
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="surface-card p-5 sm:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary"><ShieldCheck size={21} /></span>
              <h2 className="display-font mt-4 text-xl font-bold">Account security</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Your identity and password are managed securely through your main Bridal Arcade account.</p>
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border-light bg-muted/50 p-3.5">
                <LockKeyhole size={16} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-xs leading-5 text-muted-foreground">Contact Bridal Arcade support if you need to update your profile or regain account access.</p>
              </div>
            </section>

            <section className="surface-card p-5 sm:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary"><CircleHelp size={21} /></span>
              <h2 className="display-font mt-4 text-xl font-bold">Need help?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Our team can help with your account, listings, or rental orders.</p>
              <a href="mailto:info@bridalarcade.lk" className="secondary-button mt-5 w-full"><Mail size={17} />Contact support</a>
            </section>

            <button type="button" onClick={logout} className="secondary-button w-full text-destructive hover:border-destructive/25 hover:bg-destructive/5 lg:hidden"><LogOut size={17} />Sign out</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

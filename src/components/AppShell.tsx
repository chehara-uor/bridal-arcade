import { LayoutDashboard, LogOut, Package, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { logoutPartner } from "../api/portal";

const whatsappMessage = encodeURIComponent("Hi Bridal Arcade, I need help with my vendor portal.");
const whatsappUrl = `https://wa.me/94707997883?text=${whatsappMessage}`;

const items = [
  { label: "Home", desktopLabel: "Overview", path: "/bride/dashboard", icon: LayoutDashboard },
  { label: "Items", desktopLabel: "My items", path: "/bride/products", icon: Package },
  { label: "Account", desktopLabel: "Account", path: "/bride/my-account", icon: UserRound },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const name = sessionStorage.getItem("userName") || "Vendor";
  const email = sessionStorage.getItem("userEmail") || "Bridal Arcade partner";

  const logout = async () => {
    await logoutPartner();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-border-light bg-[#2d1723] px-5 py-6 text-white lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white shadow-lg">
            <img src={Logo} alt="Bridal Arcade" className="h-full w-full object-contain p-1" />
          </div>
          <div>
            <p className="display-font text-lg font-bold leading-tight">Bridal Arcade</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5b466]">Partner portal</p>
          </div>
        </div>

        <nav className="mt-10 space-y-1.5" aria-label="Primary navigation">
          {items.map(({ desktopLabel, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition ${isActive ? "bg-white text-[#3a1b2b] shadow-lg" : "text-white/65 hover:bg-white/8 hover:text-white"}`}>
              <Icon size={19} strokeWidth={2} />
              {desktopLabel}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d5b466] font-bold text-[#2d1723]">{name.charAt(0).toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-white/50">{email}</p>
            </div>
            <button onClick={logout} aria-label="Log out" className="grid h-9 w-9 place-items-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-white"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 pb-24 lg:col-start-2 lg:pb-8">{children}</main>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Bridal Arcade on WhatsApp"
        className="group fixed bottom-[86px] right-4 z-40 flex h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-white shadow-[0_10px_28px_rgba(16,120,65,.28)] transition hover:bg-[#20bd5a] hover:shadow-[0_12px_32px_rgba(16,120,65,.36)] active:scale-95 lg:bottom-6 lg:right-6"
      >
        <WhatsAppIcon />
        <span className="hidden pr-1 text-sm font-bold sm:inline">Chat with us</span>
      </a>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-light bg-white/95 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(55,28,40,0.08)] backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `flex min-h-[56px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-3 text-[11px] font-semibold transition ${isActive ? "bg-primary/8 text-primary" : "text-muted-foreground"}`}>
              <Icon size={21} strokeWidth={2.1} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-6 w-6 shrink-0 fill-current">
      <path d="M27.28 4.7A15.76 15.76 0 0 0 2.5 23.7L.25 31.9l8.4-2.2A15.72 15.72 0 0 0 16.18 31h.01A15.8 15.8 0 0 0 27.28 4.7Zm-11.1 23.63a13.1 13.1 0 0 1-6.68-1.83l-.48-.28-4.99 1.31 1.33-4.86-.31-.5a13.1 13.1 0 1 1 11.13 6.16Zm7.18-9.82c-.4-.2-2.33-1.15-2.69-1.28-.36-.13-.62-.2-.88.2-.26.39-1.01 1.28-1.24 1.54-.23.26-.46.3-.85.1-.4-.2-1.66-.61-3.16-1.95a11.83 11.83 0 0 1-2.19-2.72c-.23-.4-.02-.61.17-.8.18-.17.4-.45.6-.68.19-.23.26-.39.39-.65.13-.26.06-.49-.03-.69-.1-.2-.88-2.13-1.21-2.91-.32-.77-.65-.66-.88-.67h-.75c-.26 0-.69.1-1.05.49-.36.39-1.37 1.34-1.37 3.27 0 1.93 1.4 3.79 1.6 4.05.2.26 2.76 4.22 6.69 5.92.93.4 1.66.64 2.23.82.94.3 1.79.26 2.46.16.75-.11 2.33-.95 2.66-1.87.33-.92.33-1.7.23-1.87-.1-.16-.36-.26-.75-.46Z" />
    </svg>
  );
}

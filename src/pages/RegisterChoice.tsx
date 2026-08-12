import { ArrowRight, Heart, Store } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

export default function RegisterChoice() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#2d1723] px-5 py-8 sm:px-8 sm:py-12">
      <div className="absolute inset-0 bg-[url('/bb-bg.webp')] bg-cover bg-center opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#27131f]/70 via-[#321a27]/75 to-[#24101b]/95" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <Link to="/" className="flex w-fit items-center gap-3 text-white"><span className="h-11 w-11 overflow-hidden rounded-xl bg-white p-1 shadow-xl"><img src={Logo} alt="Bridal Arcade" className="h-full w-full object-contain" /></span><span><span className="display-font block text-lg font-bold">Bridal Arcade</span><span className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b466]">Seller portal</span></span></Link>

        <section className="my-auto py-12 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d5b466]">Create your account</p>
          <h1 className="display-font mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">Join Bridal Arcade</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70 sm:text-lg">Choose how you would like to use Bridal Arcade.</p>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 text-left md:grid-cols-2">
            <AccountCard to="/register/bride" icon={<Heart />} title="I am a Bride" description="I want to list my own bridal saree, lehenga or frock for rent or sale." />
            <AccountCard to="/register/vendor" icon={<Store />} title="I am a Shop" description="I run a bridal shop, rental business, designer studio or bridal clothing business." />
          </div>
          <p className="mt-8 text-sm text-white/55">Already have an account? <Link to="/" className="font-bold text-[#e0c680] hover:underline">Sign in</Link></p>
        </section>
      </div>
    </main>
  );
}

function AccountCard({ to, icon, title, description }: { to: string; icon: React.ReactNode; title: string; description: string }) {
  return <Link to={to} className="group rounded-3xl border border-white/15 bg-white/[.1] p-6 text-white shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#d5b466]/60 hover:bg-white/[.16] sm:p-8"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d5b466] text-[#2d1723] [&>svg]:h-6 [&>svg]:w-6">{icon}</span><h2 className="display-font mt-6 text-2xl font-bold sm:text-3xl">{title}</h2><p className="mt-3 min-h-16 text-sm leading-6 text-white/65 sm:text-base">{description}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#e0c680]">Choose this account <ArrowRight size={18} className="transition group-hover:translate-x-1" /></span></Link>;
}

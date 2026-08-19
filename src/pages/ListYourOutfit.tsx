import { useEffect } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Facebook,
  FileUp,
  Instagram,
  MessageCircle,
  Music2,
  SearchCheck,
  ShieldCheck,
  Store,
} from "lucide-react";
import Logo from "../assets/logo.png";
import HeroImage from "../assets/good.webp";
import WebsiteImage from "../assets/brides.jpg";
import VendorWidget from "./VendorWidget";
import STEP1 from "../assets/submit.webp";
import STEP2 from "../assets/clipboard.webp";
import STEP3 from "../assets/rocket.webp";

const testimonials = [
  {
    quote:
      "I had my bridal saree at home after my wedding, so I listed it through Bridal Arcade. The process was very easy and I started getting inquiries without having to post everywhere.",
    name: "Nethmi Ekanayake",
    location: "Colombo",
    initials: "NE",
  },
  {
    quote:
      "Submitting my lehenga was simple. I just sent the details and photos and Bridal Arcade handled the listing.",
    name: "Fathima",
    location: "Kandy",
    initials: "FA",
  },
  {
    quote:
      "I wanted to sell my wedding frock but didn't know where to advertise it. Bridal Arcade made the process much easier.",
    name: "Shenali Perera",
    location: "Gampaha",
    initials: "SH",
  },
  {
    quote:
      "The form was quick to complete on my phone. I uploaded my saree photos and the team took care of the rest.",
    name: "Dinithi Fernando",
    location: "Kurunegala",
    initials: "DI",
  },
  {
    quote:
      "It was a simple way to give my bridal outfit another chance instead of leaving it packed away at home.",
    name: "Ayesha",
    location: "Negombo",
    initials: "AY",
  },
];

const steps = [
  {
    icon: STEP1,
    title: "You Submit",
    text: "Send us your outfit details, price, location and clear photos using the form above.",
  },
  {
    icon: STEP2,
    title: "We Review",
    text: "Our team checks the details and prepares your listing before publishing it.",
  },
  {
    icon: STEP3,
    title: "We List",
    text: "Your outfit appears on Bridal Arcade where brides can discover and contact you.",
  },
];

function SectionHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7638]">{eyebrow}</p>}
      <h2 className="mt-2 font-['Playfair_Display'] text-[clamp(1.75rem,5vw,2.6rem)] font-bold leading-tight text-[#2c2328]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-6 text-[#70666b] sm:text-base">{text}</p>
    </div>
  );
}

export default function ListYourOutfit() {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = "List Your Bridal Outfit in Sri Lanka | Bridal Arcade";
    if (description) {
      description.content =
        "List your bridal saree, lehenga or wedding frock on Bridal Arcade. Submit your outfit details and connect with brides looking to rent or buy in Sri Lanka.";
    }
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  return (
    <div className="list-outfit-page min-w-0 overflow-x-hidden bg-[#fffdf9] text-[#2c2328]">
      <main>
        <section className="relative overflow-hidden bg-[#f8f3e9]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c6a15b]/15 blur-3xl" />
          <div className="mx-auto max-w-6xl px-5 pb-10 pt-5 sm:px-8 sm:pb-14 lg:px-10 lg:pb-16">
            <a href="https://bridalarcade.lk/" className="inline-flex items-center gap-2.5" aria-label="Bridal Arcade home">
              <img src={Logo} alt="Bridal Arcade" width="44" height="44" className="h-11 w-11 rounded-xl bg-white object-contain p-1 shadow-sm" />
              <span className="font-['Playfair_Display'] text-lg font-bold">Bridal Arcade</span>
            </a>

            <div className="mt-7 grid grid-cols-[minmax(0,1fr)] items-center gap-7 md:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] md:gap-12 lg:mt-9">
              <div className="relative z-10 min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7638]">List bridal wear in Sri Lanka</p>
                <h1 className="mt-3 max-w-2xl font-['Playfair_Display'] text-[clamp(2.25rem,8.5vw,4rem)] font-bold leading-[1.42] lg:leading-[1.2] tracking-[-0.025em] text-[#2c2328]">
                  Turn Your Bridal Outfit Into an Income
                </h1>
                <p className="mt-4 max-w-xl text-base font-semibold leading-6 text-[#55494f] sm:text-lg sm:leading-7">
                  Have a Saree, Lehenga or Bridal Frock?<br></br> List It on Bridal Arcade.
                </p>
                <p className="mt-3 max-w-xl text-[15px] leading-6 text-[#70666b] sm:text-base hidden lg:flex">
                  Connect with brides across Sri Lanka who are looking to rent or buy beautiful bridal wear.
                </p>
                <a href="#submit-outfit" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7a2352] px-6 py-3 text-sm font-bold text-[#ffffff] shadow-[0_10px_24px_rgba(151,113,46,.24)] transition hover:bg-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c692d] focus-visible:ring-offset-2 sm:w-auto">
                  List Your Outfit <FileUp size={18} aria-hidden="true" />
                </a>
                <p className="mt-3 flex max-w-xl items-start gap-2 text-xs font-medium leading-5 text-[#71656a]">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#9a7638]" aria-hidden="true" />
                  <span>Simple submission <span aria-hidden="true">•</span> We review every listing <span aria-hidden="true">•</span> Reach 45 days free of brides across Sri Lanka</span>
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-md md:max-w-none">
                <div className="absolute hidden lg:block -inset-3 rotate-2 rounded-[2rem] border border-[#c6a15b]/35" aria-hidden="true" />
                <img
                  src={HeroImage}
                  alt="Bride wearing an elegant white bridal saree"
                  width="600"
                  height="800"
                  fetchPriority="high"
                  className="relative hidden lg:block aspect-[4/3] w-full min-w-0 max-w-full rounded-[1.6rem] object-cover object-[center_30%] shadow-[0_20px_45px_rgba(58,42,49,.16)] md:aspect-[4/5]"
                />
                <div className="absolute hidden lg:flex bottom-3 left-3 right-3 items-center gap-2 rounded-xl bg-white/95 px-3 py-2.5 text-xs font-semibold shadow-lg backdrop-blur-sm sm:bottom-4 sm:left-4 sm:right-auto">
                  <CheckCircle2 size={17} className="text-[#9a7638]" aria-hidden="true" />
                  Sarees · Lehengas · Bridal Frocks
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="submit-outfit" className="scroll-mt-4 bg-white py-12 sm:py-16" aria-labelledby="submit-heading">
          <div className="mx-auto max-w-4xl px-3 sm:px-8">
            <div className="px-2 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7638]">Start your listing</p>
              <h2 id="submit-heading" className="mt-2 font-['Playfair_Display'] text-[clamp(1.8rem,6vw,2.7rem)] font-bold leading-tight">
                List Your Bridal Outfit
              </h2>
              <p className="mt-3 text-[15px] leading-6 text-[#70666b] sm:text-base">
                Send us your outfit details and photos. It only takes a few minutes.
              </p>
            </div>
            <div className="mt-7 overflow-hidden rounded-2xl sm:rounded-3xl">
              <VendorWidget embedded />
            </div>
          </div>
        </section>

        <section className="bg-[#faf7f1] py-14 sm:py-20" aria-labelledby="how-heading">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
            <div id="how-heading"><SectionHeading title="How It Works" text="Getting your bridal outfit listed is simple." /></div>
            <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
              {steps.map((step, index) => {
                return (
                  <article key={step.title} className="group rounded-2xl border border-[#eadfce] bg-white p-6 shadow-[0_8px_24px_rgba(55,40,46,.045)] transition md:hover:-translate-y-1 md:hover:shadow-[0_14px_34px_rgba(55,40,46,.08)]">
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-xl text-[#8e6b30]"><img src={step.icon} alt={step.title} className="h-full w-full object-contain p-2" /></span>
                      <span className="font-['Playfair_Display'] text-3xl font-bold text-[#c6a15b]/35">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#70666b]">{step.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-20" aria-labelledby="testimonials-heading">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
            <div id="testimonials-heading"><SectionHeading title="What Outfit Owners Say" text="Experiences from people who listed with Bridal Arcade." /></div>
            <div className="testimonial-track -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
              {testimonials.map((testimonial) => (
                <article key={testimonial.name} className="w-[85vw] max-w-[350px] shrink-0 snap-center rounded-2xl border border-[#eadfce] bg-[#fffdf9] p-5 shadow-[0_8px_24px_rgba(55,40,46,.05)] sm:w-[340px] sm:p-6">
                  <div className="text-4xl font-bold leading-6 text-[#c6a15b]" aria-hidden="true">“</div>
                  <blockquote className="mt-3 min-h-[144px] text-[15px] leading-6 text-[#51474c]">{testimonial.quote}</blockquote>
                  <div className="mt-5 flex items-center gap-3 border-t border-[#eee5d7] pt-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#3b2932] text-xs font-bold text-white">{testimonial.initials}</span>
                    <div>
                      <p className="text-sm font-bold">{testimonial.name}</p>
                      <p className="text-xs text-[#7c7075]">{testimonial.location}, Sri Lanka</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-1 text-center text-xs font-medium text-[#8a7e83]">Swipe to see more <span aria-hidden="true">👉</span></p>
          </div>
        </section>

        <section className="bg-[#f8f3e9] py-14 sm:py-20" aria-labelledby="connect-heading">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
            <div id="connect-heading"><SectionHeading eyebrow="Stay connected" title="Connect With Bridal Arcade" text="Follow our bridal community or chat with our team directly." /></div>
            <div className="mt-9 grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: Instagram, title: "Instagram", text: "Follow us on Instagram", link: "https://www.instagram.com/bridalarcade.lk/" },
                  { icon: Facebook, title: "Facebook", text: "Follow Bridal Arcade", link: "https://www.facebook.com/bridalarcade/" },
                  { icon: Music2, title: "TikTok", text: "Watch us on TikTok", link: "https://www.tiktok.com/@bridalarcade.lk" },
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                    <a href={social.link} target="_blank" rel="noreferrer" key={social.title} className="min-w-0 rounded-2xl border border-[#e3d7c5] bg-white p-4 opacity-75 sm:p-5">
                      <Icon size={23} className="text-[#9a7638]" aria-hidden="true" />
                      <p className="mt-4 text-sm font-bold">{social.title}</p>
                      <p className="mt-1 break-words text-xs leading-4 text-[#756970]">{social.text}</p>
                    </a>
                  );
                })}
                <a href="https://wa.me/94707997883" target="_blank" rel="noreferrer" className="min-w-0 rounded-2xl border border-[#c6a15b]/60 bg-white p-4 transition hover:border-[#9a7638] hover:shadow-md sm:p-5">
                  <MessageCircle size={23} className="text-[#9a7638]" aria-hidden="true" />
                  <p className="mt-4 text-sm font-bold">WhatsApp</p>
                  <p className="mt-1 break-words text-xs leading-4 text-[#756970]">Chat With Us</p>
                  <p className="mt-2 text-xs font-bold text-[#76602f]">070 799 7883</p>
                </a>
              </div>

              <article className="overflow-hidden rounded-2xl border border-[#e3d7c5] bg-white shadow-[0_12px_32px_rgba(55,40,46,.07)]">
                <a href="https://bridalarcade.lk/" target="_blank" rel="noreferrer" aria-label="Visit the Bridal Arcade website" className="block overflow-hidden">
                  <div className="flex h-8 items-center gap-1.5 bg-[#37252e] px-3" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-white/30" /><span className="h-2 w-2 rounded-full bg-white/30" /><span className="h-2 w-2 rounded-full bg-[#c6a15b]" /></div>
                  <img src={WebsiteImage} alt="Preview of bridal styles on Bridal Arcade" width="1280" height="720" loading="lazy" className="aspect-[16/8] w-full object-cover transition duration-300 hover:scale-[1.015]" />
                </a>
                <div className="p-5 sm:p-6">
                  <h3 className="font-['Playfair_Display'] text-2xl font-bold">See Bridal Arcade</h3>
                  <p className="mt-2 text-sm leading-6 text-[#70666b]">Browse bridal sarees, lehengas, frocks and other bridal wear already listed on our platform.</p>
                  <a href="https://bridalarcade.lk/" target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#35252d] px-5 text-sm font-bold text-white transition hover:bg-[#23191e] sm:w-auto">
                    Visit Bridal Arcade <ExternalLink size={16} aria-hidden="true" />
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[#36242d] px-5 py-14 text-center text-white sm:py-16" aria-labelledby="final-cta-heading">
          <div className="mx-auto max-w-2xl">
            <h2 id="final-cta-heading" className="font-['Playfair_Display'] text-[clamp(1.8rem,6vw,2.8rem)] font-bold leading-tight">Ready to List Your Bridal Outfit?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">Give your bridal wear another chance to be discovered by a bride looking for the perfect outfit.</p>
            <a href="#submit-outfit" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c6a15b] px-6 text-sm font-bold text-[#241d20] transition hover:bg-[#d2b274] sm:w-auto">
              List My Outfit <FileUp size={18} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-[#241920] px-5 py-8 text-white/75">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Bridal Arcade" width="44" height="44" loading="lazy" className="h-11 w-11 rounded-xl bg-white object-contain p-1" />
            <div><p className="font-['Playfair_Display'] font-bold text-white">Bridal Arcade</p><p className="mt-0.5 text-xs">Sri Lanka's bridal marketplace</p></div>
          </div>
          <address className="flex flex-col gap-2 text-sm not-italic sm:items-end">
            <a href="tel:+94707997883" className="hover:text-[#d5b66f]">070 799 7883</a>
            <a href="mailto:hello@bridalarcade.lk" className="hover:text-[#d5b66f]">hello@bridalarcade.lk</a>
            <a href="https://bridalarcade.lk/" className="hover:text-[#d5b66f]">bridalarcade.lk</a>
          </address>
        </div>
        <p className="mx-auto mt-7 max-w-6xl border-t border-white/10 pt-5 text-xs">© {new Date().getFullYear()} Bridal Arcade. All rights reserved.</p>
      </footer>
    </div>
  );
}

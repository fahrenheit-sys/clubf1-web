import Image from "next/image";
import WaitlistForm from "./waitlist-form";

const socials = [
  { name: "Instagram", href: "https://www.instagram.com/fahrenheit_one" },
  { name: "Facebook", href: "https://www.facebook.com/FahrenheitOne/" },
];

const pillars = [
  { title: "Train", body: "A premium gym floor, group fitness, and eGym smart strength — guided every step." },
  { title: "Restore", body: "A dedicated recovery centre and wellness circuit built for longevity, not just workouts." },
  { title: "Belong", body: "Pool, pickleball, run club, and a socially connected community at Hakoah White City." },
];

export default function Home() {
  return (
    <main className="bg-forest text-cream">
      {/* ───────── Hero ───────── */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(circle_at_50%_30%,#fff_0,transparent_55%)]" />
        <div className="relative">
          <Image
            src="/fahrenheit-one-logo.png"
            alt="Fahrenheit One"
            width={190}
            height={60}
            className="mx-auto mb-10 h-14 w-auto brightness-0 invert"
            priority
          />
          <div className="eyebrow text-[11px] text-gold mb-6">
            @ Hakoah White City · Launching April 2027
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.05] sm:text-6xl">
            Something extraordinary
            <br />
            <span className="text-gold">is coming.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/80">
            Fahrenheit One is a premium fitness and wellness club being built at
            the heart of the new Hakoah White City. Follow the journey — and be
            first through the doors.
          </p>

          {/* Social CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/25 px-5 py-2.5 text-sm font-medium text-cream transition hover:border-gold hover:text-gold"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── What it is ───────── */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <div className="eyebrow mb-2 text-[11px] text-gold">{p.title}</div>
                <p className="text-sm leading-relaxed text-cream/75">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Notify capture ───────── */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-medium sm:text-4xl">
            Be first to know.
          </h2>
          <p className="mx-auto mt-4 mb-9 max-w-md text-cream/70">
            Drop your details and we'll keep you posted as the club takes shape —
            previews, milestones, and your invitation to join.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-white/10 px-6 py-10 text-center">
        <div className="eyebrow text-[10px] text-cream/45">
          Fahrenheit One @ Hakoah White City · Opening April 2027
        </div>
      </footer>
    </main>
  );
}

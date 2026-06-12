import Image from "next/image";
import OptInForm from "./opt-in-form";

const ecosystem = [
  { title: "Gym & Group Fitness", body: "A premium training floor and a full class timetable, seven days a week." },
  { title: "Recovery Centre", body: "Sauna, ice, and dedicated recovery space to train smarter and live longer." },
  { title: "Wellness Circuit & Yoga", body: "Guided wellness programming, yoga, and eGym smart strength." },
  { title: "25m Pool & Swim", body: "Part of the new White City aquatic precinct, right on your doorstep." },
  { title: "Pickleball & Courts", body: "The fastest-growing sport in the country — and a community around it." },
  { title: "Run Club & Community", body: "A socially connected club where you're recognised, supported, and motivated." },
];

const founderBenefits = [
  { title: "Rate locked for life", body: "Founders lock in their founding rate permanently — it never goes up." },
  { title: "First access", body: "VIP priority when founding memberships open, before anyone else." },
  { title: "Shape the club", body: "Founders help define the programming, the culture, and the community." },
  { title: "Founder events", body: "Exclusive previews and gatherings on the road to opening day." },
];

export default function Home() {
  return (
    <main className="bg-cream text-ink">
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-forest text-cream">
        <div className="absolute inset-0 opacity-[0.07] [background:radial-gradient(circle_at_30%_20%,#fff_0,transparent_45%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <Image
            src="/fahrenheit-one-logo.png"
            alt="Fahrenheit One"
            width={150}
            height={48}
            className="mb-10 h-12 w-auto brightness-0 invert"
            priority
          />
          <div className="eyebrow text-[11px] text-gold mb-5">
            Fahrenheit One @ Hakoah White City
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.05] sm:text-6xl">
            Our community's club.
            <br />
            <span className="text-gold">Be one of its founders.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-cream/80">
            A premium fitness and wellness home opening at Hakoah White City in
            April 2027. Founding members lock in their rate for life — and help
            shape the club from day one.
          </p>
          <a
            href="#join"
            className="mt-9 inline-block rounded-lg bg-gold px-7 py-4 font-medium text-forest transition hover:brightness-105"
          >
            Join the Founders List
          </a>
        </div>
      </section>

      {/* ───────── Vision ───────── */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="eyebrow text-[11px] text-green-mid mb-4">The vision</div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-medium leading-tight sm:text-4xl">
          Something extraordinary is being built in White City.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          A generational rebuild of the Hakoah campus — pools, courts, gardens,
          and gathering places. At its heart sits Fahrenheit One: not a gym, but a
          premium fitness and wellness ecosystem designed around community,
          guidance, and belonging.
        </p>
      </section>

      {/* ───────── Ecosystem ───────── */}
      <section className="bg-cream-2 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="eyebrow text-[11px] text-green-mid mb-3 text-center">Inside the club</div>
          <h2 className="mb-12 text-center font-[family-name:var(--font-display)] text-3xl font-medium sm:text-4xl">
            One membership. A whole ecosystem.
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ecosystem.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-white p-7">
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-medium text-forest">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Founder benefits ───────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="eyebrow text-[11px] text-gold mb-3 text-center">Why found</div>
        <h2 className="mb-12 text-center font-[family-name:var(--font-display)] text-3xl font-medium sm:text-4xl">
          Founders get the best of everything.
        </h2>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {founderBenefits.map((b) => (
            <div key={b.title} className="bg-white p-8">
              <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-medium text-forest">
                {b.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Opt-in ───────── */}
      <section id="join" className="bg-forest py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="eyebrow text-[11px] text-gold mb-3 text-center">Join the founders list</div>
          <h2 className="mb-3 text-center font-[family-name:var(--font-display)] text-3xl font-medium text-cream sm:text-4xl">
            Claim your place.
          </h2>
          <p className="mb-10 text-center text-cream/70">
            No payment today — just tell us a little about you and we'll keep you
            first in line.
          </p>
          <div className="rounded-2xl bg-cream p-6 sm:p-9">
            <OptInForm />
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-forest pb-12 text-center text-cream/50">
        <div className="eyebrow text-[10px]">@ Hakoah White City · Opening April 2027</div>
      </footer>
    </main>
  );
}

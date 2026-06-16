import type { Metadata } from "next";
import Image from "next/image";
import OptInForm from "../opt-in-form";

export const metadata: Metadata = {
  title: "Fahrenheit One @ Hakoah White City — Eastern Suburbs",
  description:
    "The most complete fitness and wellness club ever to come to Sydney's Eastern Suburbs. Opening at Hakoah White City, April 2027. Join the VIP list.",
  robots: { index: false, follow: false }, // targeted local campaign page — not for search
};

const ecosystem = [
  { title: "Gym & Group Fitness", body: "A premium training floor and a full class timetable, seven days a week." },
  { title: "Recovery Centre", body: "Sauna, ice, and dedicated recovery space to train smarter and live longer." },
  { title: "Wellness Circuit & Yoga", body: "Guided wellness programming, yoga, and eGym smart strength." },
  { title: "25m Pool & Swim", body: "A full aquatic precinct — lap swimming and learn-to-swim on your doorstep." },
  { title: "Pickleball & Courts", body: "The fastest-growing sport in the country, with courts and a community around it." },
  { title: "Run Club & Community", body: "A socially connected club where you're recognised, supported, and motivated." },
];

const reasons = [
  { title: "Nothing like it nearby", body: "A full fitness, wellness, recovery and aquatic ecosystem under one roof — not just another gym." },
  { title: "Founding rate for life", body: "Lock in the lowest rate we'll ever offer, permanently, as a founding local member." },
  { title: "First through the doors", body: "VIP list members get priority access before memberships open to the public." },
  { title: "Built for the Eastern Suburbs", body: "Designed around how this neighbourhood actually trains, recovers and connects." },
];

export default function LocalPage() {
  return (
    <main className="bg-cream text-ink">
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-terra text-cream">
        <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(circle_at_70%_20%,#fff_0,transparent_45%)]" />
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
            The best club the Eastern Suburbs
            <br />
            <span className="text-gold">has ever seen.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-cream/85">
            A premium fitness, wellness and recovery destination opening at Hakoah
            White City in April 2027. Get on the VIP list and lock in a founding
            rate before anyone else.
          </p>
          <a
            href="#join"
            className="mt-9 inline-block rounded-lg bg-gold px-7 py-4 font-medium text-forest transition hover:brightness-105"
          >
            Join the VIP List
          </a>
        </div>
      </section>

      {/* ───────── Why ───────── */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="eyebrow text-[11px] text-terra mb-4">Something new for the neighbourhood</div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-medium leading-tight sm:text-4xl">
          The Eastern Suburbs is finally getting the club it deserves.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Fahrenheit One isn't another gym. It's a complete fitness and wellness
          ecosystem — training, recovery, wellness, pool, courts and community —
          built into the heart of the new Hakoah White City.
        </p>
      </section>

      {/* ───────── Ecosystem ───────── */}
      <section className="bg-cream-2 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="eyebrow text-[11px] text-terra mb-3 text-center">Inside the club</div>
          <h2 className="mb-12 text-center font-[family-name:var(--font-display)] text-3xl font-medium sm:text-4xl">
            One membership. A whole ecosystem.
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ecosystem.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-white p-7">
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-medium text-terra">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Reasons ───────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="eyebrow text-[11px] text-gold mb-3 text-center">Why join the VIP list</div>
        <h2 className="mb-12 text-center font-[family-name:var(--font-display)] text-3xl font-medium sm:text-4xl">
          Get in before everyone else.
        </h2>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {reasons.map((b) => (
            <div key={b.title} className="bg-white p-8">
              <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-medium text-terra">
                {b.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Opt-in ───────── */}
      <section id="join" className="bg-terra py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="eyebrow text-[11px] text-gold mb-3 text-center">Join the VIP list</div>
          <h2 className="mb-3 text-center font-[family-name:var(--font-display)] text-3xl font-medium text-cream sm:text-4xl">
            Claim your place.
          </h2>
          <p className="mb-10 text-center text-cream/80">
            No payment today — just tell us a little about you and we'll keep you
            first in line.
          </p>
          <div className="rounded-2xl bg-cream p-6 sm:p-9">
            <OptInForm track="local" />
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-terra pb-12 text-center text-cream/60">
        <div className="eyebrow text-[10px]">@ Hakoah White City · Opening April 2027</div>
      </footer>
    </main>
  );
}

"use client";

import { useState, useTransition } from "react";
import { submitOptIn } from "./actions";
import {
  PREFERRED_TIME_OPTIONS,
  INTEREST_OPTIONS,
  type OptInInput,
} from "./form-options";

const years = Array.from({ length: 2013 - 1925 }, (_, i) => 2012 - i); // 2012 → 1925

const field =
  "w-full rounded-lg border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-green-mid focus:ring-2 focus:ring-green-mid/20";
const label = "eyebrow text-[11px] text-muted mb-1.5 block";

export default function OptInForm({ track }: { track: "community" | "local" }) {
  const [form, setForm] = useState<OptInInput>({
    track,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredTime: "",
    interest: "",
    yearOfBirth: "",
    isHakoahMember: "No",
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const set = (k: keyof OptInInput, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await submitOptIn(form);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-forest px-8 py-12 text-center text-cream">
        <div className="eyebrow text-[11px] text-gold mb-3">You're on the list</div>
        <h3 className="font-[family-name:var(--font-display)] text-3xl font-medium mb-3">
          {track === "community" ? "Welcome, founder." : "You're in."}
        </h3>
        <p className="mx-auto max-w-md text-cream/80">
          You're on the Fahrenheit One list. Watch your inbox — we'll share the
          journey, invite you to events, and give you first access when founding
          memberships open.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className={label}>First name</label>
        <input className={field} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
      </div>
      <div>
        <label className={label}>Last name</label>
        <input className={field} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
      </div>
      <div>
        <label className={label}>Email</label>
        <input type="email" className={field} value={form.email} onChange={(e) => set("email", e.target.value)} required />
      </div>
      <div>
        <label className={label}>Mobile</label>
        <input type="tel" className={field} value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
      </div>
      <div>
        <label className={label}>When do you train?</label>
        <select className={field} value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)} required>
          <option value="" disabled>Choose a time…</option>
          {PREFERRED_TIME_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className={label}>Interested in</label>
        <select className={field} value={form.interest} onChange={(e) => set("interest", e.target.value)} required>
          <option value="" disabled>Choose…</option>
          {INTEREST_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div className={track === "community" ? "" : "sm:col-span-2"}>
        <label className={label}>Year of birth</label>
        <select className={field} value={form.yearOfBirth} onChange={(e) => set("yearOfBirth", e.target.value)} required>
          <option value="" disabled>Choose…</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {track === "community" && (
        <div>
          <label className={label}>Are you a Hakoah member?</label>
          <select className={field} value={form.isHakoahMember} onChange={(e) => set("isHakoahMember", e.target.value)}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
      )}

      {error && <p className="sm:col-span-2 text-sm text-terra">{error}</p>}

      <div className="sm:col-span-2 mt-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gold px-6 py-4 font-medium text-forest transition hover:brightness-105 disabled:opacity-60"
        >
          {pending ? "Joining…" : track === "community" ? "Join the Founders List" : "Join the VIP List"}
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          Founding rate locked for life · No payment today · Unsubscribe anytime
        </p>
      </div>
    </form>
  );
}

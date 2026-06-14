"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitWaitlist } from "./actions";
import { captureTracking, fireLeadConversion, newEventId } from "./lib/tracking";

export default function WaitlistForm() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const tracking = useRef<ReturnType<typeof captureTracking>>({});
  useEffect(() => {
    tracking.current = captureTracking();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const eventId = newEventId();
    start(async () => {
      const res = await submitWaitlist({
        firstName,
        email,
        tracking: { ...tracking.current, eventId },
      });
      if (res.ok) {
        fireLeadConversion({ eventId, track: "local", interest: "waitlist" });
        setDone(true);
      } else setError(res.error);
    });
  };

  if (done) {
    return (
      <p className="text-center text-cream/90">
        You're on the list — we'll be in touch as the journey unfolds. 🔥
      </p>
    );
  }

  const field =
    "w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
      <input
        className={field}
        placeholder="First name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        aria-label="First name"
      />
      <input
        type="email"
        required
        className={field}
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-gold px-6 py-3 font-medium text-forest transition hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "…" : "Notify me"}
      </button>
      {error && <p className="w-full text-sm text-gold sm:text-center">{error}</p>}
    </form>
  );
}

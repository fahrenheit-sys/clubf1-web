"use server";

// Submits a community opt-in to GoHighLevel via the v2 API, creating/updating the
// contact with all segmentation tags computed up front (track, source, type,
// tribe, generation). A GHL workflow (trigger: tag `source::opt-in-form` added)
// then creates the pipeline opportunity and syncs the lead to Supabase.

import crypto from "crypto";
import { headers } from "next/headers";
import {
  PREFERRED_TIME_OPTIONS,
  INTEREST_OPTIONS,
  type OptInInput,
  type OptInResult,
  type WaitlistInput,
  type TrackingParams,
} from "./form-options";

const GHL_BASE = "https://services.leadconnectorhq.com";

// Custom field IDs in the "Fahrenheit One White City" sub-account.
const FIELD_IDS = {
  preferred_time: "BpoSe2yPMFN59Y17l0Ag",
  membership_interest: "Kg9YVN5qI4GLbTsy9Nll",
  year_of_birth: "Sf0Cb9ESgch7087rQyzo",
  is_hakoah_member: "V78R8ELPqNcpgjWpPMuc",
  gen_tribe_code: "bOKu2Y5nLIzHmi6fKXuX",
};

const DASHBOARD_WEBHOOK_URL =
  process.env.DASHBOARD_WEBHOOK_URL || "https://dashboard.clubf1.tech/api/webhook/ghl";

// Best-effort sync of an opt-in to the dashboard's Supabase webhook. Never blocks
// the user — the contact is already safely in GHL; this is the analytics mirror.
async function syncToDashboard(payload: unknown): Promise<void> {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("GHL_WEBHOOK_SECRET not set — skipping dashboard sync");
    return;
  }
  try {
    const r = await fetch(DASHBOARD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ghl-secret": secret },
      body: JSON.stringify(payload),
    });
    if (!r.ok) console.error("Dashboard sync failed", r.status, await r.text());
  } catch (err) {
    console.error("Dashboard sync error", err);
  }
}

// ───────────────────────── Meta Conversions API ─────────────────────────
// Server-side "Lead" event. Runs only when both a Pixel ID and a CAPI token are
// configured, so it's inert until those env vars are set. Shares `eventId` with
// the browser Pixel event so Meta deduplicates the pair into a single Lead.
const META_API_VERSION = "v21.0";

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const hashNorm = (v?: string) => (v ? sha256(v.trim().toLowerCase()) : undefined);

// Normalise an AU mobile to E.164-without-plus for Meta (e.g. 0412… → 61412…).
function hashPhone(p?: string): string | undefined {
  if (!p) return undefined;
  let d = p.replace(/\D/g, "");
  if (!d) return undefined;
  if (d.startsWith("0") && d.length === 10) d = "61" + d.slice(1);
  else if (d.length === 9) d = "61" + d;
  return sha256(d);
}

async function sendMetaLead(args: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  track: string;
  interest?: string;
  tracking?: TrackingParams;
}): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return; // not configured — no-op

  const t = args.tracking ?? {};
  let clientIp: string | undefined;
  let userAgent: string | undefined;
  try {
    const h = await headers();
    userAgent = h.get("user-agent") ?? undefined;
    clientIp = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || undefined;
  } catch {
    /* headers unavailable — send without them */
  }

  const user_data: Record<string, unknown> = {};
  const em = hashNorm(args.email);
  if (em) user_data.em = [em];
  const ph = hashPhone(args.phone);
  if (ph) user_data.ph = [ph];
  const fn = hashNorm(args.firstName);
  if (fn) user_data.fn = [fn];
  const ln = hashNorm(args.lastName);
  if (ln) user_data.ln = [ln];
  if (t.fbp) user_data.fbp = t.fbp;
  if (t.fbc) user_data.fbc = t.fbc;
  if (clientIp) user_data.client_ip_address = clientIp;
  if (userAgent) user_data.client_user_agent = userAgent;

  const event = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_id: t.eventId,
    event_source_url: t.pageUrl,
    user_data,
    custom_data: {
      content_name: `${args.track} opt-in`,
      content_category: args.interest,
    },
  };

  // Optional: route to Events Manager → Test Events while verifying the setup.
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
  const payload: Record<string, unknown> = { data: [event] };
  if (testCode) payload.test_event_code = testCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) console.error("Meta CAPI failed", res.status, await res.text());
  } catch (err) {
    console.error("Meta CAPI error", err);
  }
}

const TRIBE_TAG: Record<string, string> = {
  "Early Morning (5–8am)": "tribe::6am-crew",
  "Mid Morning (8–11am)": "tribe::school-run-squad",
  "Lunchtime (11am–2pm)": "tribe::lunch-break-legends",
  "Afternoon (2–5pm)": "tribe::afternoon-avengers",
  "Evening (5–8pm)": "tribe::5pm-tribe",
  Weekends: "tribe::weekend-warriors",
};

function generationTag(yob: number): string | null {
  if (!yob) return null;
  if (yob >= 2010) return "gen::gen-alpha";
  if (yob >= 1997) return "gen::gen-z";
  if (yob >= 1981) return "gen::millennial";
  if (yob >= 1965) return "gen::gen-x";
  if (yob >= 1946) return "gen::boomer";
  return "gen::silent-gen";
}

const TRIBE_CODE: Record<string, string> = {
  "Early Morning (5–8am)": "morning",
  "Mid Morning (8–11am)": "school_run",
  "Lunchtime (11am–2pm)": "lunch_break",
  "Afternoon (2–5pm)": "afternoon",
  "Evening (5–8pm)": "evening",
  Weekends: "weekend",
};

function computeGenTribeCode(yob: number, preferredTime: string): string | null {
  const tribe = TRIBE_CODE[preferredTime];
  if (!tribe || !yob) return null;
  let gen: string;
  if (yob >= 2010) gen = "gen_alpha";
  else if (yob >= 1997) gen = "gen_z";
  else if (yob >= 1981) gen = "millennial";
  else if (yob >= 1965) gen = "gen_x";
  else if (yob >= 1946) gen = "boomer";
  else gen = "silent_gen";
  return `${gen}_${tribe}`;
}

export async function submitOptIn(input: OptInInput): Promise<OptInResult> {
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const yob = parseInt(input.yearOfBirth, 10);
  const thisYear = 2026;

  if (!firstName) return { ok: false, error: "Please enter your first name." };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, error: "Please enter a valid email address." };
  if (!phone || phone.replace(/\D/g, "").length < 8)
    return { ok: false, error: "Please enter a valid mobile number." };
  if (!PREFERRED_TIME_OPTIONS.includes(input.preferredTime as never))
    return { ok: false, error: "Please tell us when you train." };
  if (!INTEREST_OPTIONS.includes(input.interest as never))
    return { ok: false, error: "Please choose a membership interest." };
  if (!yob || yob < 1920 || yob > thisYear - 13)
    return { ok: false, error: "Please enter a valid year of birth." };

  const token = process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error("Missing GHL_PRIVATE_TOKEN / GHL_LOCATION_ID env vars");
    return { ok: false, error: "We couldn't submit that just now. Please try again shortly." };
  }

  const track = input.track === "local" ? "local" : "community";

  const tags = [`track::${track}`, "source::opt-in-form", `type::${input.interest.toLowerCase()}`];
  const tribe = TRIBE_TAG[input.preferredTime];
  if (tribe) tags.push(tribe);
  const gen = generationTag(yob);
  if (gen) tags.push(gen);

  const customFields: { id: string; value: string }[] = [
    { id: FIELD_IDS.preferred_time, value: input.preferredTime },
    { id: FIELD_IDS.membership_interest, value: input.interest },
    { id: FIELD_IDS.year_of_birth, value: String(yob) },
  ];
  const genTribeCode = computeGenTribeCode(yob, input.preferredTime);
  if (genTribeCode) customFields.push({ id: FIELD_IDS.gen_tribe_code, value: genTribeCode });
  // The Hakoah-member question is only asked on the community page.
  if (track === "community") {
    customFields.push({
      id: FIELD_IDS.is_hakoah_member,
      value: input.isHakoahMember === "Yes" ? "Yes" : "No",
    });
  }

  const body = {
    locationId,
    firstName,
    lastName,
    email,
    phone: phone || undefined,
    source: `clubf1.com.au ${track} opt-in`,
    tags,
    customFields,
  };

  try {
    const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("GHL upsert failed", res.status, await res.text());
      return { ok: false, error: "Something went wrong on our end. Please try again." };
    }

    // Fire-and-forget the two best-effort downstreams in parallel: the dashboard
    // webhook (→ Supabase, carrying UTM attribution) and the Meta Conversions API.
    await Promise.allSettled([
      syncToDashboard({
        type: "opt_in",
        contact: {
          firstName,
          lastName,
          email,
          phone,
          tags,
          pipelineStage: "VIP Waitlist",
          // The dashboard webhook reads attributionSource.utm* and normalises it
          // into lead_source for the analytics.
          attributionSource: {
            utmSource: input.tracking?.utmSource ?? null,
            utmMedium: input.tracking?.utmMedium ?? null,
            utmCampaign: input.tracking?.utmCampaign ?? null,
          },
          customField: {
            year_of_birth: String(yob),
            preferred_time: input.preferredTime,
            membership_interest: input.interest,
            ...(track === "community"
              ? { is_hakoah_member: input.isHakoahMember === "Yes" ? "Yes" : "No" }
              : {}),
          },
        },
      }),
      sendMetaLead({
        email,
        phone,
        firstName,
        lastName,
        track,
        interest: input.interest,
        tracking: input.tracking,
      }),
    ]);

    return { ok: true };
  } catch (err) {
    console.error("GHL upsert error", err);
    return { ok: false, error: "Network error. Please try again." };
  }
}

// Lightweight waitlist capture from the root "launching soon" page. General
// public interest — tagged source::organic + track::local (the public/Eastern
// Suburbs audience; community signups come through /community). No pipeline.
export async function submitWaitlist(input: WaitlistInput): Promise<OptInResult> {
  const firstName = input.firstName?.trim();
  const email = input.email?.trim().toLowerCase();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, error: "Please enter a valid email address." };

  const token = process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error("Missing GHL_PRIVATE_TOKEN / GHL_LOCATION_ID env vars");
    return { ok: false, error: "We couldn't submit that just now. Please try again shortly." };
  }

  const body = {
    locationId,
    firstName: firstName || undefined,
    email,
    source: "clubf1.com.au launching-soon waitlist",
    tags: ["source::organic", "track::local"],
  };

  try {
    const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("GHL waitlist upsert failed", res.status, await res.text());
      return { ok: false, error: "Something went wrong on our end. Please try again." };
    }
    // Server-side Meta Lead (email match only) — no-op until CAPI env is set.
    await sendMetaLead({
      email,
      firstName,
      track: "local",
      interest: "waitlist",
      tracking: input.tracking,
    });
    return { ok: true };
  } catch (err) {
    console.error("GHL waitlist upsert error", err);
    return { ok: false, error: "Network error. Please try again." };
  }
}

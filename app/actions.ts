"use server";

// Submits a community opt-in to GoHighLevel via the v2 API, creating/updating the
// contact with all segmentation tags computed up front (track, source, type,
// tribe, generation). A GHL workflow (trigger: tag `source::opt-in-form` added)
// then creates the pipeline opportunity and syncs the lead to Supabase.

import {
  PREFERRED_TIME_OPTIONS,
  INTEREST_OPTIONS,
  type OptInInput,
  type OptInResult,
  type WaitlistInput,
} from "./form-options";

const GHL_BASE = "https://services.leadconnectorhq.com";

// Custom field IDs in the "Fahrenheit One White City" sub-account.
const FIELD_IDS = {
  preferred_time: "BpoSe2yPMFN59Y17l0Ag",
  membership_interest: "Kg9YVN5qI4GLbTsy9Nll",
  year_of_birth: "Sf0Cb9ESgch7087rQyzo",
  is_hakoah_member: "V78R8ELPqNcpgjWpPMuc",
};

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

  const tags = ["track::community", "source::opt-in-form", `type::${input.interest.toLowerCase()}`];
  const tribe = TRIBE_TAG[input.preferredTime];
  if (tribe) tags.push(tribe);
  const gen = generationTag(yob);
  if (gen) tags.push(gen);

  const body = {
    locationId,
    firstName,
    lastName,
    email,
    phone: phone || undefined,
    source: "clubf1.com.au community opt-in",
    tags,
    customFields: [
      { id: FIELD_IDS.preferred_time, value: input.preferredTime },
      { id: FIELD_IDS.membership_interest, value: input.interest },
      { id: FIELD_IDS.year_of_birth, value: String(yob) },
      { id: FIELD_IDS.is_hakoah_member, value: input.isHakoahMember === "Yes" ? "Yes" : "No" },
    ],
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
    return { ok: true };
  } catch (err) {
    console.error("GHL waitlist upsert error", err);
    return { ok: false, error: "Network error. Please try again." };
  }
}

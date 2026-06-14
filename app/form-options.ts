// Plain (non-server) module: shared form constants + types. These cannot live in
// actions.ts because a "use server" file may only export async functions.

// Values must match the GHL SINGLE_OPTIONS picklists exactly.
export const PREFERRED_TIME_OPTIONS = [
  "Early Morning (5–8am)",
  "Mid Morning (8–11am)",
  "Lunchtime (11am–2pm)",
  "Afternoon (2–5pm)",
  "Evening (5–8pm)",
  "Weekends",
] as const;

export const INTEREST_OPTIONS = ["Fitness", "Wellness", "Lifestyle"] as const;

// Ad-attribution + conversion-matching params captured client-side from the URL
// (utm_*, gclid, fbclid) and the browser (Meta _fbp/_fbc cookies). `eventId` is a
// per-submission id shared between the client Pixel `Lead` event and the
// server-side Conversions API call so Meta deduplicates the two into one.
export type TrackingParams = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  eventId?: string;
  pageUrl?: string;
};

export type OptInInput = {
  track: "community" | "local";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredTime: string;
  interest: string;
  yearOfBirth: string;
  isHakoahMember?: string; // "Yes" | "No" — community only
  tracking?: TrackingParams;
};

export type OptInResult = { ok: true } | { ok: false; error: string };

// Lightweight "be first to know" capture on the root launching-soon page.
export type WaitlistInput = {
  firstName: string;
  email: string;
  tracking?: TrackingParams;
};

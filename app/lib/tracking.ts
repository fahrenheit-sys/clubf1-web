// Client-side ad-attribution helpers. Reads UTM params + click ids from the
// landing URL, persists them for the session (first touch wins, so a later
// in-site navigation doesn't wipe the ad that brought them in), and reads Meta's
// _fbp/_fbc cookies for Conversions API match quality. Also fires the client-side
// Meta Pixel + Google Ads conversion events on a successful opt-in.

import type { TrackingParams } from "../form-options";

const STORAGE_KEY = "f1_tracking";

const UTM_KEYS: Record<string, keyof TrackingParams> = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_term: "utmTerm",
  utm_content: "utmContent",
  gclid: "gclid",
  fbclid: "fbclid",
};

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : undefined;
}

// Persist first-touch UTM/click ids for the session so a later page hop (e.g. / →
// /community) still attributes to the original ad.
function loadStored(): TrackingParams {
  if (typeof sessionStorage === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStored(params: TrackingParams) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    /* private mode / quota — non-fatal */
  }
}

// Call once on form mount. Merges this page's URL params over anything already
// stored (first-touch kept for empty slots), persists, and returns the set.
export function captureTracking(): TrackingParams {
  if (typeof window === "undefined") return {};

  const stored = loadStored();
  const url = new URL(window.location.href);
  const fromUrl: TrackingParams = {};
  for (const [param, key] of Object.entries(UTM_KEYS)) {
    const v = url.searchParams.get(param);
    if (v) fromUrl[key] = v;
  }

  // First-touch wins: keep stored values, only fill gaps from this URL.
  const merged: TrackingParams = { ...fromUrl, ...stored };
  saveStored(merged);

  // Cookies + page URL are read fresh each time (not persisted).
  merged.fbp = readCookie("_fbp");
  let fbc = readCookie("_fbc");
  // The Pixel sets _fbc shortly after load; if a click just landed, build it per
  // Meta's spec so the very first conversion still has the click match.
  if (!fbc && merged.fbclid) {
    fbc = `fb.1.${Date.now()}.${merged.fbclid}`;
  }
  merged.fbc = fbc;
  merged.pageUrl = window.location.href;

  return merged;
}

export function newEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `evt-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Fire the client-side conversion events on opt-in success. Each is a no-op if
// its tag isn't loaded (env var unset), so this is always safe to call.
export function fireLeadConversion(opts: {
  eventId: string;
  track: string;
  interest: string;
}) {
  const { eventId, track, interest } = opts;

  // Meta Pixel — same eventID as the server CAPI call so Meta dedupes to one Lead.
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(
      "track",
      "Lead",
      { content_name: `${track} opt-in`, content_category: interest },
      { eventID: eventId },
    );
  }

  // Google Ads conversion — send_to is the full "AW-XXXXXXXXX/LABEL" string.
  const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_SEND_TO;
  if (sendTo && typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: sendTo,
      transaction_id: eventId,
    });
  }
}

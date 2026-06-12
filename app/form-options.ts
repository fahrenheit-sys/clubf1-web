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

export type OptInInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredTime: string;
  interest: string;
  yearOfBirth: string;
  isHakoahMember: string; // "Yes" | "No"
};

export type OptInResult = { ok: true } | { ok: false; error: string };

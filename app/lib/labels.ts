// Human-readable tribe and generation labels, written to GHL at capture.
//
// These used to be derived by two GHL workflows running twelve conditional
// branches between them — re-deriving in the CRM what the capture routes had
// already worked out to build the tribe:: and gen:: tags. Deriving once, here,
// keeps the tag and the label from ever disagreeing.

export const FIELD_TRIBE_LABEL      = 'sWzccTHpo4uqWF2n4gkQ'
export const FIELD_GENERATION_LABEL = 'noZKkfTdpE0y03rPYlT6'

const TRIBE_LABEL: Record<string, string> = {
  'Early Morning (5–8am)': '6AM Crew',
  'Mid Morning (8–11am)':  'School Run Squad',
  'Lunchtime (11am–2pm)':  'Lunch Break Legends',
  'Afternoon (2–5pm)':     'Afternoon Avengers',
  'Evening (5–8pm)':       '5PM Tribe',
  'Weekends':              'Weekend Warriors',
}

export function tribeLabel(preferredTime?: string): string | null {
  if (!preferredTime) return null
  return TRIBE_LABEL[preferredTime] ?? null
}

export function generationLabel(yob?: number): string | null {
  if (!yob || yob < 1900 || yob > 2100) return null
  if (yob >= 2010) return 'Gen Alpha'
  if (yob >= 1997) return 'Gen Z'
  if (yob >= 1981) return 'Millennial'
  if (yob >= 1965) return 'Gen X'
  if (yob >= 1946) return 'Boomer'
  return 'Silent Gen'
}

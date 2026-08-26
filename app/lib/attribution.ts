// Campaign attribution shared by the root waitlist (stage 1) and the root
// profile popup (stage 2). Both must emit the same channel tag: GHL's upsert
// REPLACES a contact's tags rather than merging them, so stage 2 has to
// re-send every tag stage 1 applied or they are silently dropped.

export type Tracking = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  fbclid?: string
}

const slug = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32)

/**
 * `channel::<utm_source>` — sits alongside `source::organic` rather than
 * replacing it, so the existing workflow triggers keyed on `source::organic`
 * keep firing. Falls back to the click ids when no utm_source is present.
 */
export function channelTag(t?: Tracking): string | null {
  if (!t) return null
  const raw = t.utm_source || (t.fbclid ? 'meta' : t.gclid ? 'google' : '')
  const s = raw ? slug(raw) : ''
  return s ? `channel::${s}` : null
}

/** Human-readable campaign string written to the GHL contact's Source field. */
export function sourceLabel(t: Tracking | undefined, fallback: string): string {
  if (!t) return fallback
  const parts = [t.utm_source, t.utm_medium, t.utm_campaign].filter(Boolean)
  return parts.length ? parts.join(' / ') : fallback
}

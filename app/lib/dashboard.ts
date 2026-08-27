// Dashboard sync — best-effort POST to the Supabase-backed pre-sales dashboard.
// Never throws: a lead is already saved in GHL by the time this runs, and a
// dashboard outage must not fail the submission.

import type { Tracking } from './attribution'

type SyncArgs = {
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  tags: string[]
  track: 'community' | 'local'
  pipelineStage?: string
  tracking?: Tracking
  heardAbout?: string
  customField?: Record<string, string | undefined>
}

export function syncDashboard(a: SyncArgs): void {
  const secret = process.env.GHL_WEBHOOK_SECRET
  if (!secret) return

  const t = a.tracking ?? {}
  fetch('https://dashboard.clubf1.tech/api/webhook/ghl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-ghl-secret': secret },
    body: JSON.stringify({
      type: 'opt_in',
      contact: {
        firstName: a.firstName?.trim() || '',
        lastName:  a.lastName?.trim() || '',
        email:     a.email.trim().toLowerCase(),
        phone:     a.phone?.trim() || null,
        tags:      a.tags,
        track:     a.track,
        pipelineStage: a.pipelineStage ?? 'VIP Waitlist',
        customField: {
          ...a.customField,
          heard_about: a.heardAbout || undefined,
        },
        attributionSource: {
          utmSource:   t.utm_source   ?? null,
          utmMedium:   t.utm_medium   ?? null,
          utmCampaign: t.utm_campaign ?? null,
        },
      },
    }),
  }).catch(err => console.error('Dashboard sync error', err))
}

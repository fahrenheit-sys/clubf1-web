// Dashboard sync — POST to the Supabase-backed pre-sales dashboard.
//
// This is AWAITED by its callers, deliberately. It used to be fire-and-forget,
// and the stage-2 popup sync never arrived: on Vercel the function instance can
// be frozen once the response is returned, so a pending fetch is simply dropped.
// The route that did the most work before calling it lost every time.
//
// It still never throws — a dashboard outage must not fail a lead submission —
// it just costs ~200ms to be sure the request actually left.

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

export async function syncDashboard(a: SyncArgs): Promise<void> {
  const secret = process.env.GHL_WEBHOOK_SECRET
  if (!secret) return

  const t = a.tracking ?? {}
  await fetch('https://dashboard.clubf1.tech/api/webhook/ghl', {
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

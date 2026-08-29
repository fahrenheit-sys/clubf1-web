import { NextRequest, NextResponse } from 'next/server'
import { channelTag, sourceLabel, type Tracking } from '@/app/lib/attribution'
import { syncDashboard } from '@/app/lib/dashboard'

const GHL_BASE = 'https://services.leadconnectorhq.com'

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, phone, tracking } = (await req.json()) as {
    firstName?: string; lastName?: string; email?: string; phone?: string; tracking?: Tracking
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const token = process.env.GHL_PRIVATE_TOKEN
  const locationId = process.env.GHL_LOCATION_ID
  if (!token || !locationId) {
    console.error('Missing GHL_PRIVATE_TOKEN / GHL_LOCATION_ID')
    return NextResponse.json({ ok: false, error: 'Configuration error.' }, { status: 500 })
  }

  // GHL upsert replaces tags, so every tag this contact should carry is sent here.
  const tags = ['source::organic', 'track::local']
  const channel = channelTag(tracking)
  if (channel) tags.push(channel)

  const body = {
    locationId,
    firstName: firstName?.trim() || undefined,
    lastName: lastName?.trim() || undefined,
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || undefined,
    source: sourceLabel(tracking, 'clubf1.com.au root waitlist'),
    tags,
    // track — drives the track conditionals in the email templates
    customFields: [{ id: '2CAwgSqsn7xWUgGHkeNC', value: 'local' }],
  }

  try {
    const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error('GHL upsert failed', res.status, await res.text())
      return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // Opportunity in Local — Eastern Suburbs @ VIP Waitlist. Created here, not by
    // a workflow: every other capture path already creates its own in code, and
    // a workflow step that silently does nothing is exactly how a real lead went
    // without a welcome email on 28 Aug.
    const upsertData = await res.json()
    const contactId  = upsertData?.contact?.id
    if (contactId) {
      const oppName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ')
      const oppRes  = await fetch(`${GHL_BASE}/opportunities/`, {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${token}`,
          Version:        '2021-07-28',
          'Content-Type': 'application/json',
          Accept:         'application/json',
        },
        body: JSON.stringify({
          pipelineId:      '7fTiSRP3JaSVORKMTYux',
          pipelineStageId: '4508b4f3-737f-444c-893b-d9467db67200',
          locationId,
          contactId,
          name:   oppName || email.trim().toLowerCase(),
          status: 'open',
          // Carry the campaign onto the opportunity too. A workflow-created
          // opportunity inherits the contact's source for free; one created
          // here does not, so a code-created lead would show a blank Source
          // on the pipeline card while a workflow-created one showed its channel.
          source: sourceLabel(tracking, 'clubf1.com.au root waitlist'),
        }),
      })
      if (!oppRes.ok) {
        console.error('GHL opportunity creation failed', oppRes.status, await oppRes.text())
      }
    }

    // Dashboard sync — root leads were previously never reaching Supabase,
    // so every organic and Instagram lead was invisible on the dashboard.
    await syncDashboard({
      firstName, lastName, email: email.trim().toLowerCase(), phone,
      tags, track: 'local', tracking,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('GHL upsert error', err)
    return NextResponse.json({ ok: false, error: 'Network error. Please try again.' }, { status: 500 })
  }
}

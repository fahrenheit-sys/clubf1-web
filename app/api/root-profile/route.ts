import { NextRequest, NextResponse } from 'next/server'
import { channelTag, heardTag, sourceLabel, type Tracking } from '@/app/lib/attribution'
import { syncDashboard } from '@/app/lib/dashboard'
import { FIELD_TRIBE_LABEL, FIELD_GENERATION_LABEL, tribeLabel, generationLabel } from '@/app/lib/labels'

const GHL_BASE = 'https://services.leadconnectorhq.com'

const FIELD_IDS = {
  track:               '2CAwgSqsn7xWUgGHkeNC',
  preferred_time:     'BpoSe2yPMFN59Y17l0Ag',
  membership_interest:'Kg9YVN5qI4GLbTsy9Nll',
  year_of_birth:      'Sf0Cb9ESgch7087rQyzo',
  gen_tribe_code:     'bOKu2Y5nLIzHmi6fKXuX',
}

const TRIBE_TAG: Record<string, string> = {
  'Early Morning (5–8am)': 'tribe::6am-crew',
  'Mid Morning (8–11am)':  'tribe::school-run-squad',
  'Lunchtime (11am–2pm)':  'tribe::lunch-break-legends',
  'Afternoon (2–5pm)':     'tribe::afternoon-avengers',
  'Evening (5–8pm)':       'tribe::5pm-tribe',
  'Weekends':              'tribe::weekend-warriors',
}

const TRIBE_CODE: Record<string, string> = {
  'Early Morning (5–8am)': 'morning',
  'Mid Morning (8–11am)':  'school_run',
  'Lunchtime (11am–2pm)':  'lunch_break',
  'Afternoon (2–5pm)':     'afternoon',
  'Evening (5–8pm)':       'evening',
  'Weekends':              'weekend',
}

function generationTag(yob: number): string {
  if (yob >= 2010) return 'gen::gen-alpha'
  if (yob >= 1997) return 'gen::gen-z'
  if (yob >= 1981) return 'gen::millennial'
  if (yob >= 1965) return 'gen::gen-x'
  if (yob >= 1946) return 'gen::boomer'
  return 'gen::silent-gen'
}

function genCode(yob: number): string {
  if (yob >= 2010) return 'gen_alpha'
  if (yob >= 1997) return 'gen_z'
  if (yob >= 1981) return 'millennial'
  if (yob >= 1965) return 'gen_x'
  if (yob >= 1946) return 'boomer'
  return 'silent_gen'
}

// Enriches a root organic lead after they complete the profile popup.
// Updates the GHL contact with interest / tribe / generation tags and custom
// fields, then creates the pipeline opportunity directly (bypassing the GHL
// opt-in workflow to avoid duplicate opportunity creation).
export async function POST(req: NextRequest) {
  const payload = await req.json()
  const { email, interest, preferredTime, yearOfBirth } = payload
  const tracking = payload.tracking as Tracking | undefined
  const heard    = heardTag(payload.heardAbout as string | undefined)

  if (!email) {
    return NextResponse.json({ ok: false, error: 'Missing email.' }, { status: 400 })
  }

  const token      = process.env.GHL_PRIVATE_TOKEN
  const locationId = process.env.GHL_LOCATION_ID
  if (!token || !locationId) {
    console.error('Missing GHL_PRIVATE_TOKEN / GHL_LOCATION_ID')
    return NextResponse.json({ ok: false, error: 'Configuration error.' }, { status: 500 })
  }

  const yob        = parseInt(yearOfBirth, 10)
  const tribeTag   = TRIBE_TAG[preferredTime]
  const tribeCode  = TRIBE_CODE[preferredTime]
  const validYob   = yob >= 1920 && yob <= 2013

  // Always re-send the base tags so they survive a GHL tag-replace on upsert
  const tags: string[] = ['source::organic', 'track::local']
  // Re-send the channel tag stage 1 applied — this upsert would otherwise drop it.
  const channel = channelTag(tracking)
  if (channel) tags.push(channel)
  if (heard) tags.push(heard)
  if (interest === 'not-sure') {
    tags.push('type::not-sure')
  } else if (interest) {
    tags.push(`type::${interest.toLowerCase()}`)
  }
  if (tribeTag)          tags.push(tribeTag)
  if (validYob)          tags.push(generationTag(yob))

  const customFields: { id: string; value: string }[] = [
    { id: FIELD_IDS.track, value: 'local' },   // drives the track conditionals in the email templates
  ]
  // Only set membership_interest for the three valid picklist values
  if (interest && interest !== 'not-sure') {
    customFields.push({ id: FIELD_IDS.membership_interest, value: interest })
  }
  if (preferredTime) {
    customFields.push({ id: FIELD_IDS.preferred_time, value: preferredTime })
  }
  const tLabel = tribeLabel(preferredTime)
  const gLabel = validYob ? generationLabel(yob) : null
  if (tLabel) customFields.push({ id: FIELD_TRIBE_LABEL, value: tLabel })
  if (gLabel) customFields.push({ id: FIELD_GENERATION_LABEL, value: gLabel })
  if (validYob) {
    customFields.push({ id: FIELD_IDS.year_of_birth, value: String(yob) })
    if (tribeCode) {
      customFields.push({ id: FIELD_IDS.gen_tribe_code, value: `${genCode(yob)}_${tribeCode}` })
    }
  }

  try {
    // 1. Upsert contact — adds new tags/fields, keeps existing source::organic + track::local
    const upsertRes = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: {
        Authorization:   `Bearer ${token}`,
        Version:         '2021-07-28',
        'Content-Type':  'application/json',
        Accept:          'application/json',
      },
      body: JSON.stringify({
        locationId,
        email: email.trim().toLowerCase(),
        ...(tags.length && { tags }),
        ...(customFields.length && { customFields }),
      }),
    })

    if (!upsertRes.ok) {
      console.error('GHL root-profile upsert failed', upsertRes.status, await upsertRes.text())
      return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    const upsertData = await upsertRes.json()
    const contactId  = upsertData?.contact?.id
    const firstName  = upsertData?.contact?.firstName
    const lastName   = upsertData?.contact?.lastName
    const fullName   = [firstName, lastName].filter(Boolean).join(' ')

    // 2. Create opportunity in Local — Eastern Suburbs @ VIP Waitlist
    if (contactId) {
      const oppRes = await fetch(`${GHL_BASE}/opportunities/`, {
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
          name:   fullName || email,
          status: 'open',
          // Carry the campaign onto the opportunity too. A workflow-created
          // opportunity inherits the contact's source for free; one created
          // here does not, so a code-created lead would show a blank Source
          // on the pipeline card while a workflow-created one showed its channel.
          source: sourceLabel(tracking, 'clubf1.com.au root waitlist'),
        }),
      })
      if (!oppRes.ok) {
        // Log but don't fail — contact is already enriched
        console.error('GHL opportunity creation failed', oppRes.status, await oppRes.text())
      }
    }

    // Dashboard sync — upserts on email, enriching the stage-1 row.
    await syncDashboard({
      firstName, lastName, email: email.trim().toLowerCase(),
      tags, track: 'local', tracking, heardAbout: payload.heardAbout,
      customField: {
        year_of_birth: validYob ? String(yob) : undefined,
        preferred_time: preferredTime,
        membership_interest: interest,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Root profile error', err)
    return NextResponse.json({ ok: false, error: 'Network error. Please try again.' }, { status: 500 })
  }
}

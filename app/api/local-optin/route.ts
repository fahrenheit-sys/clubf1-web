import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { channelTag, heardTag, sourceLabel, type Tracking } from '@/app/lib/attribution'

const GHL_BASE = 'https://services.leadconnectorhq.com'

const FIELD_IDS = {
  preferred_time:      'BpoSe2yPMFN59Y17l0Ag',
  membership_interest: 'Kg9YVN5qI4GLbTsy9Nll',
  year_of_birth:       'Sf0Cb9ESgch7087rQyzo',
  gen_tribe_code:      'bOKu2Y5nLIzHmi6fKXuX',
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

const sha256   = (v: string) => crypto.createHash('sha256').update(v).digest('hex')
const hashNorm = (v?: string) => (v ? sha256(v.trim().toLowerCase()) : undefined)
function hashPhone(p?: string): string | undefined {
  if (!p) return undefined
  let d = p.replace(/\D/g, '')
  if (!d) return undefined
  if (d.startsWith('0') && d.length === 10) d = '61' + d.slice(1)
  else if (d.length === 9) d = '61' + d
  return sha256(d)
}

async function sendMetaLead(args: {
  email?: string; phone?: string; firstName?: string; lastName?: string
  pixelId: string; capiToken: string; eventId?: string
}): Promise<void> {
  const user_data: Record<string, unknown> = {}
  const em = hashNorm(args.email);  if (em) user_data.em = [em]
  const ph = hashPhone(args.phone); if (ph) user_data.ph = [ph]
  const fn = hashNorm(args.firstName); if (fn) user_data.fn = [fn]
  const ln = hashNorm(args.lastName);  if (ln) user_data.ln = [ln]

  const payload: Record<string, unknown> = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_id: args.eventId,
      event_source_url: 'https://www.clubf1.com.au/local',
      user_data,
      custom_data: { content_name: 'local vip opt-in' },
    }],
  }
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE
  if (testCode) payload.test_event_code = testCode

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${args.pixelId}/events?access_token=${encodeURIComponent(args.capiToken)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    )
    if (!res.ok) console.error('Meta CAPI failed', res.status, await res.text())
  } catch (err) { console.error('Meta CAPI error', err) }
}

const VALID_TIMES     = ['Early Morning (5–8am)', 'Mid Morning (8–11am)', 'Lunchtime (11am–2pm)', 'Afternoon (2–5pm)', 'Evening (5–8pm)', 'Weekends']
const VALID_INTERESTS = ['Fitness', 'Wellness', 'Lifestyle']

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const { firstName, lastName, email, phone, yearOfBirth, preferredTime, membershipInterest } = payload
  const tracking = payload.tracking as Tracking | undefined
  const heard    = heardTag(payload.heardAbout as string | undefined)

  if (!firstName?.trim())
    return NextResponse.json({ ok: false, error: 'Please enter your first name.' }, { status: 400 })
  if (!email?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 })
  if (!phone?.trim() || phone.replace(/\D/g, '').length < 8)
    return NextResponse.json({ ok: false, error: 'Please enter a valid mobile number.' }, { status: 400 })

  const yob = parseInt(yearOfBirth, 10)
  if (!yob || yob < 1925 || yob > 2012)
    return NextResponse.json({ ok: false, error: 'Please enter a valid year of birth.' }, { status: 400 })
  if (!VALID_TIMES.includes(preferredTime))
    return NextResponse.json({ ok: false, error: 'Please tell us when you train.' }, { status: 400 })
  if (!VALID_INTERESTS.includes(membershipInterest))
    return NextResponse.json({ ok: false, error: 'Please choose a membership interest.' }, { status: 400 })

  const token      = process.env.GHL_PRIVATE_TOKEN
  const locationId = process.env.GHL_LOCATION_ID
  if (!token || !locationId) {
    console.error('Missing GHL env vars')
    return NextResponse.json({ ok: false, error: 'Configuration error.' }, { status: 500 })
  }

  const tags     = ['track::local', 'source::opt-in-form', `type::${membershipInterest.toLowerCase()}`]
  const tribeTag = TRIBE_TAG[preferredTime]
  if (tribeTag) tags.push(tribeTag)
  tags.push(generationTag(yob))

  const tribeCode     = TRIBE_CODE[preferredTime]
  const gen_tribe_code = tribeCode ? `${genCode(yob)}_${tribeCode}` : null

  const customFields = [
    { id: FIELD_IDS.preferred_time,      value: preferredTime },
    { id: FIELD_IDS.membership_interest, value: membershipInterest },
    { id: FIELD_IDS.year_of_birth,       value: String(yob) },
  ]
  if (gen_tribe_code) customFields.push({ id: FIELD_IDS.gen_tribe_code, value: gen_tribe_code })

  // GHL upsert replaces tags, so the channel tag has to travel with the rest.
  const channel = channelTag(tracking)
  if (channel) tags.push(channel)
  if (heard) tags.push(heard)

  const body = {
    locationId,
    firstName:    firstName.trim(),
    lastName:     lastName?.trim() || undefined,
    email:        email.trim().toLowerCase(),
    phone:        phone.trim(),
    source:       sourceLabel(tracking, 'clubf1.com.au local vip opt-in'),
    tags,
    customFields,
  }

  try {
    const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        Version:        '2021-07-28',
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error('GHL upsert failed', res.status, await res.text())
      return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // Opportunity in Local — Eastern Suburbs @ VIP Waitlist. Created here rather than by a GHL
    // workflow: tag triggers don't retro-enrol, and the workflow that used to do
    // this no longer exists. Failure is logged, not fatal — the contact is saved.
    const upsertData = await res.json()
    const contactId  = upsertData?.contact?.id
    if (contactId) {
      const oppName = [firstName.trim(), lastName?.trim()].filter(Boolean).join(' ')
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
        }),
      })
      if (!oppRes.ok) {
        console.error('GHL opportunity creation failed', oppRes.status, await oppRes.text())
      }
    }

    // Dashboard sync — best-effort
    const secret = process.env.GHL_WEBHOOK_SECRET
    if (secret) {
      fetch('https://dashboard.clubf1.tech/api/webhook/ghl', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-ghl-secret': secret },
        body:    JSON.stringify({
          type: 'opt_in',
          contact: {
            firstName: firstName.trim(), lastName: lastName?.trim(),
            email: email.trim().toLowerCase(), phone: phone.trim(),
            tags, pipelineStage: 'VIP Waitlist',
            customField: {
              year_of_birth: String(yob), preferred_time: preferredTime,
              membership_interest: membershipInterest,
            },
          },
        }),
      }).catch(err => console.error('Dashboard sync error', err))
    }

    // Meta CAPI — best-effort
    const pixelId    = process.env.NEXT_PUBLIC_META_PIXEL_ID
    const capiToken  = process.env.META_CAPI_TOKEN
    if (pixelId && capiToken) {
      sendMetaLead({ email: email.trim(), phone: phone.trim(), firstName: firstName.trim(), lastName: lastName?.trim(), pixelId, capiToken })
        .catch(err => console.error('Meta CAPI error', err))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('GHL upsert error', err)
    return NextResponse.json({ ok: false, error: 'Network error. Please try again.' }, { status: 500 })
  }
}

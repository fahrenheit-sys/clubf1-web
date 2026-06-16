import { NextRequest, NextResponse } from 'next/server'

const GHL_BASE = 'https://services.leadconnectorhq.com'

export async function POST(req: NextRequest) {
  const { firstName, email, phone } = await req.json()

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const token = process.env.GHL_PRIVATE_TOKEN
  const locationId = process.env.GHL_LOCATION_ID
  if (!token || !locationId) {
    console.error('Missing GHL_PRIVATE_TOKEN / GHL_LOCATION_ID')
    return NextResponse.json({ ok: false, error: 'Configuration error.' }, { status: 500 })
  }

  const body = {
    locationId,
    firstName: firstName?.trim() || undefined,
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || undefined,
    source: 'clubf1.com.au root waitlist',
    tags: ['source::organic', 'track::local'],
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

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('GHL upsert error', err)
    return NextResponse.json({ ok: false, error: 'Network error. Please try again.' }, { status: 500 })
  }
}

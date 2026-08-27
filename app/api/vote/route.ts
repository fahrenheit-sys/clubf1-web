import { NextRequest, NextResponse } from 'next/server'
import { isValidVote, type Question } from '@/app/lib/votes'

const GHL_BASE = 'https://services.leadconnectorhq.com'

// A vote arrives as a GET — it is a link in an email, tapped once.
export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const q = url.searchParams.get('q')
  const a = url.searchParams.get('a')
  const c = url.searchParams.get('c')   // GHL contact id, from {{contact.id}}

  const back = (params: string) => NextResponse.redirect(new URL(`/vote?${params}`, url.origin), 302)
  if (!isValidVote(q, a)) return back('error=1')

  const question = q as Question

  // Record it. A failure here must not cost the vote — the redirect still
  // happens and the contact is still tagged, so an outage loses analytics
  // rather than the response itself.
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supaUrl && supaKey && c) {
    fetch(`${supaUrl}/rest/v1/votes?on_conflict=ghl_contact_id,question`, {
      method: 'POST',
      headers: {
        apikey: supaKey,
        Authorization: `Bearer ${supaKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',   // let someone change their mind
      },
      body: JSON.stringify({ ghl_contact_id: c, question, answer: a }),
    }).catch(err => console.error('Vote insert failed', err))
  }

  // Tag the contact so the answer shows in GHL and can drive a smart list.
  // Uses the add-tags endpoint, never upsert — upsert REPLACES a contact's tags.
  const token = process.env.GHL_PRIVATE_TOKEN
  if (token && c) {
    fetch(`${GHL_BASE}/contacts/${c}/tags`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ tags: [`vote::${question}-${a}`] }),
    }).catch(err => console.error('Vote tag failed', err))
  }

  return back(`q=${question}&a=${a}`)
}

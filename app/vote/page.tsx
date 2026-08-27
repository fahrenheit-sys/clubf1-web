import { QUESTIONS, type Question } from '@/app/lib/votes'

export const dynamic = 'force-dynamic'

const PLUM = '#2A1830', CLAY = '#C65A2E', CLAY_LIGHT = '#D98A5E', LILAC = '#C9B6C6'

export default async function VotePage(
  { searchParams }: { searchParams: Promise<{ q?: string; a?: string; error?: string }> },
) {
  const sp = await searchParams
  const q = sp.q as Question | undefined
  const known = q && QUESTIONS[q]
  const answer = known && sp.a ? QUESTIONS[q].options[sp.a] : undefined
  const failed = sp.error === '1' || !answer

  return (
    <main style={{
      minHeight: '100vh', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(120% 90% at 50% 15%, #3A2240 0%, ${PLUM} 46%, #150A19 100%)`,
      fontFamily: "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '32px 24px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{ height: 6, background: CLAY, width: 64, margin: '0 auto 40px' }} />

        <p style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: CLAY_LIGHT, margin: '0 0 20px',
        }}>
          {failed ? 'Something went wrong' : 'Thank you'}
        </p>

        <h1 style={{
          fontFamily: "'Newsreader', Georgia, serif", fontWeight: 400,
          fontSize: 'clamp(30px, 6vw, 44px)', lineHeight: 1.15, color: '#fff', margin: '0 0 20px',
        }}>
          {failed ? 'That link didn’t work.' : 'Your vote is in.'}
        </h1>

        <p style={{ fontSize: 17, lineHeight: 1.65, color: LILAC, margin: '0 0 12px' }}>
          {failed
            ? 'The link may have been broken by your email app. You can reply to our email instead — we read every one.'
            : <>You picked <span style={{ color: '#fff' }}>{answer}</span>.</>}
        </p>

        {!failed && (
          <p style={{ fontSize: 17, lineHeight: 1.65, color: LILAC, margin: '0 0 36px' }}>
            We’re building this club around the people who’ll use it, and answers like yours
            decide what opens first. We’ll share what everyone chose in the next update.
          </p>
        )}

        <a href="https://www.clubf1.com.au/?utm_source=email&utm_medium=vote&utm_campaign=shape-your-club"
          style={{
            display: 'inline-block', padding: '15px 32px', background: CLAY, color: '#fff',
            textDecoration: 'none', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 2,
          }}>
          Back to Fahrenheit One
        </a>

        <p style={{ fontSize: 12, color: '#8A7185', marginTop: 40, letterSpacing: '0.04em' }}>
          Fahrenheit One @ Hakoah Paddington · Opening April 2027
        </p>
      </div>
    </main>
  )
}

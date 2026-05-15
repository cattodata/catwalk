// Express handler for /api/resend — real bulk email via Resend
// (resend.com, free tier 100/day). Mirrors api/resend.ts (Vercel format).
// Falls back to a stub response when RESEND_API_KEY is missing — UI flow
// stays intact for demo without the env var.

function applyMerge(html, recipient) {
  return String(html)
    .replace(/\{\{\s*name\s*\}\}/g, recipient.name ?? 'there')
    .replace(/\{\{\s*street\s*\}\}/g, recipient.street ?? 'Chatswood')
}

async function sendOne(apiKey, from, subject, html, recipient) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient.email],
        subject: applyMerge(subject, recipient),
        html: applyMerge(html, recipient),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { accepted: false, error: data.error?.message ?? `HTTP ${res.status}` }
    }
    return { accepted: true, id: data.data?.id ?? data.id }
  } catch (err) {
    return { accepted: false, error: err instanceof Error ? err.message : 'unknown' }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' })
    return
  }
  const body = req.body
  if (!body?.to || !Array.isArray(body.to) || body.to.length === 0) {
    res.status(400).json({ error: 'missing-recipients' })
    return
  }
  if (!body.subject || !body.html) {
    res.status(400).json({ error: 'missing-subject-or-html' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = body.from ?? 'Catto Compass Pilot <onboarding@resend.dev>'

  if (!apiKey) {
    res.status(200).json({
      id: `demo-${Date.now().toString(36)}`,
      accepted: body.to.length,
      rejected: 0,
      source: 'stub',
      note: 'RESEND_API_KEY not configured — returning demo response so UI flow stays intact.',
    })
    return
  }

  const results = await Promise.all(
    body.to.slice(0, 50).map((r) => sendOne(apiKey, from, body.subject, body.html, r)),
  )
  const accepted = results.filter((r) => r.accepted).length
  const rejected = results.length - accepted
  const firstId = results.find((r) => r.id)?.id

  res.status(200).json({
    id: firstId ?? `batch-${Date.now().toString(36)}`,
    accepted,
    rejected,
    source: 'resend',
    errors: results.filter((r) => !r.accepted).map((r) => r.error),
  })
}

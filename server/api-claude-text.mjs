// Express handler for /api/claude-text — generic text-in/text-out proxy to
// Azure OpenAI gpt-mini. Mirrors api/claude-text.ts (Vercel format).
// Used by Catto Radar (AI weekly brief + bulk email translation).

async function callAzure(b) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT
  if (!endpoint || !apiKey || !deployment) return null

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: b.system },
          { role: 'user', content: b.user },
        ],
        max_completion_tokens: b.maxTokens ?? 600,
        temperature: 0.6,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? null
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' })
    return
  }
  const body = req.body
  if (!body?.system || !body?.user) {
    res.status(400).json({ error: 'missing-system-or-user' })
    return
  }
  const text = await callAzure(body)
  if (text != null) {
    res.status(200).json({ text, source: 'azure-openai' })
    return
  }
  res.status(502).json({ error: 'no-provider-configured', source: 'none' })
}

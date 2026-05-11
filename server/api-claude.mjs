// Express handler for /api/claude — proxies Azure OpenAI gpt-4.1-nano OR Anthropic Claude.
// Mirrors api/claude.ts (Vercel format) so frontend works identically against either runtime.

const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MAX_TOKENS = 4000

function buildSystemPrompt(b) {
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][b.dayOfWeek]
  const weatherStr = b.weather
    ? `${b.weather.temp}°C, ${b.weather.label}${b.weather.isRain ? ` (raining ${b.weather.precipitation.toFixed(1)}mm)` : ''}`
    : 'unknown'
  const compStr = b.competitorCounts
    ? `${b.competitorCounts.cafes} cafes, ${b.competitorCounts.restaurants} restaurants, ${b.competitorCounts.bakeries} bakeries within 700m`
    : 'unknown'
  const demoStr = b.demographics
    ? `Chatswood pop ${b.demographics.population}, ${b.demographics.chinese_pct}% Chinese ancestry, ${b.demographics.korean_pct}% Korean ancestry`
    : 'Chatswood NSW, ~25K population, 40% Chinese ancestry, 8% Korean'

  return `You are Catto Compass — a hyperlocal marketing AI for small Chatswood businesses.

CONTEXT
- Location: Chatswood NSW, Australia (Willoughby City Council)
- Business type: ${b.bizType}${b.shopName ? ` (${b.shopName})` : ''}
- Time: ${dayName} ${b.hour}:00 (Sydney local)
- Weather: ${weatherStr}
- Competition: ${compStr}
- Demographics: ${demoStr}
- Council pilot: walkers earn 2× points if they walk 300m+ from the station

TASK
1. Look at the uploaded product photo. Describe it in one sentence ("visionRead").
2. Pick ONE strategy from: discount | bundle | traffic | stock | aware (based on signals).
3. Score the opportunity 0-100 ("score").
4. Write a campaign: name, tag, offer, why-this-wins.
5. List 5 signals (real reasons why this campaign works now), each with impact text.
6. Estimate revenue uplift ($), orders, avg ticket, and time window.
7. Generate 5 execution assets, each in EN + Simplified Chinese + Korean:
   - ig (Instagram caption with hashtags, ~3 lines)
   - google (Google Business post, ~1 line)
   - sign (counter A4: { big, sub })
   - script (staff verbal script, conversational, ~1 paragraph)
   - plan (6 bullet timeline of execution steps)

CRITICAL RULES
- Translate naturally — DO NOT use Google-Translate-quality output. Match local Chinese/Korean idiom.
- Tag campaigns with concrete prices in AUD.
- Reference real Chatswood landmarks where relevant (Westfield, The Concourse, Chatswood Chase, Mall Markets).
- If raining, push warm/indoor offers; if hot, cold drinks.
- If lots of competitors, bundle > discount.
- Keep tone friendly, Aussie-casual but not slangy.

OUTPUT — return ONLY valid JSON, no markdown, exactly this shape:
{
  "visionRead": "string",
  "chosen": "discount|bundle|traffic|stock|aware",
  "name": "string",
  "tag": "string",
  "offer": "string",
  "why": "string",
  "signals": [{"name": "string", "impact": "string"}, ... 5 items],
  "revenue": number,
  "orders": number,
  "avg": number,
  "score": number,
  "windowText": "string",
  "assets": {
    "ig":     {"en":"...","zh":"...","ko":"..."},
    "google": {"en":"...","zh":"...","ko":"..."},
    "sign":   {"en":{"big":"...","sub":"..."},"zh":{...},"ko":{...}},
    "script": {"en":"...","zh":"...","ko":"..."},
    "plan":   {"en":["...","..."], "zh":[...], "ko":[...]}
  }
}`
}

async function callAzure(body, systemPrompt) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview'

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`

  const azureRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Generate the marketing campaign now. Output JSON only — no preamble.' },
            { type: 'image_url', image_url: { url: `data:${body.photoMime || 'image/jpeg'};base64,${body.photoBase64}` } },
          ],
        },
      ],
      max_completion_tokens: MAX_TOKENS + 1000,
      response_format: { type: 'json_object' },
    }),
  })
  if (!azureRes.ok) {
    const errText = await azureRes.text()
    throw new Error(`Azure OpenAI ${azureRes.status}: ${errText.slice(0, 300)}`)
  }
  const data = await azureRes.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callAnthropic(body, systemPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const anthropicRes = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: body.photoMime || 'image/jpeg', data: body.photoBase64 } },
            { type: 'text', text: 'Generate the marketing campaign now. Output JSON only — no preamble.' },
          ],
        },
      ],
    }),
  })
  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text()
    throw new Error(`Anthropic ${anthropicRes.status}: ${errText.slice(0, 300)}`)
  }
  const payload = await anthropicRes.json()
  return payload.content?.find((c) => c.type === 'text')?.text || ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const hasAzure = !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_DEPLOYMENT)
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  if (!hasAzure && !hasAnthropic) {
    return res.status(503).json({
      error: 'No LLM provider configured',
      hint: 'Set ANTHROPIC_API_KEY or AZURE_OPENAI_{ENDPOINT,API_KEY,DEPLOYMENT}',
    })
  }

  const body = req.body
  if (!body?.photoBase64 || !body?.bizType) {
    return res.status(400).json({ error: 'photoBase64 and bizType required' })
  }

  const t0 = Date.now()
  const systemPrompt = buildSystemPrompt(body)
  const provider = hasAzure ? 'azure' : 'anthropic'

  try {
    const rawText = hasAzure ? await callAzure(body, systemPrompt) : await callAnthropic(body, systemPrompt)
    if (!rawText) return res.status(502).json({ error: `${provider} returned empty text` })

    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      .trim()

    let campaign
    try {
      campaign = JSON.parse(cleaned)
    } catch {
      console.error(`${provider} non-JSON:`, cleaned.slice(0, 500))
      return res.status(502).json({ error: `${provider} returned non-JSON`, snippet: cleaned.slice(0, 200) })
    }

    return res.status(200).json({ campaign, source: 'live', provider, durationMs: Date.now() - t0 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('claude handler error:', message)
    return res.status(500).json({ error: message, provider })
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * POST /api/claude-text
 * Generic text-in / text-out proxy to Azure OpenAI gpt-4.1-nano (preferred when
 * configured) or Anthropic Claude. Used by Catto Radar (AI brief + email
 * translation). Falls back to a 502 so the caller renders a deterministic stub.
 */

interface ReqBody {
  system: string
  user: string
  maxTokens?: number
}

interface AzureChoice {
  message?: { content?: string }
}
interface AzureResp {
  choices?: AzureChoice[]
  error?: { message?: string }
}

async function callAzure(b: ReqBody): Promise<string | null> {
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
    const data = (await res.json()) as AzureResp
    return data.choices?.[0]?.message?.content ?? null
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' })
    return
  }
  const body = req.body as ReqBody | undefined
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

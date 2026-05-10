import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * GET /api/nominatim?q=cafe+chatswood+nsw
 * Server-side proxy to OSM Nominatim — required because Nominatim policy
 * mandates a custom User-Agent header (which browsers can't set).
 *
 * Rate limit: 1 req/sec per User-Agent.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' })
  }

  const q = String(req.query.q ?? '').trim()
  if (!q) return res.status(400).json({ error: 'q required' })

  const params = new URLSearchParams({
    q,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '10',
    countrycodes: 'au',
  })

  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        'User-Agent': 'CattoCompass/1.0 (https://catto-compass.vercel.app; cattodata.com)',
      },
    })
    if (!r.ok) {
      return res.status(502).json({ error: `Nominatim ${r.status}` })
    }
    const data = await r.json()
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    return res.status(200).json(data)
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown'
    return res.status(500).json({ error: m })
  }
}

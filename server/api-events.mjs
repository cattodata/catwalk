// Live events scraper for Willoughby Council + Concourse.
// Falls back to curated weekly events if scrape fails.

const WILLOUGHBY_EVENTS_URL = 'https://www.willoughby.nsw.gov.au/Things-to-do/Events'
const CONCOURSE_EVENTS_URL = 'https://www.theconcourse.com.au/whats-on'

let cache = { at: 0, data: null }
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6h

const FALLBACK_EVENTS = [
  { dow: 1, emoji: '📚', title: 'Library Storytime', venue: 'Willoughby City Library', window: '10:30am-11:00am', footTraffic: 'low', source: 'willoughby.nsw.gov.au' },
  { dow: 2, emoji: '🎨', title: 'Concourse Art Lunch', venue: 'The Concourse', window: '12pm-1:30pm', footTraffic: 'mid', source: 'theconcourse.com.au' },
  { dow: 3, emoji: '🛒', title: 'Chatswood Mall Markets', venue: 'Chatswood Mall (Victoria Ave)', window: '9am-5pm', footTraffic: 'high', source: 'willoughby.nsw.gov.au' },
  { dow: 4, emoji: '🎭', title: 'Concourse Comedy Night', venue: 'The Concourse Theatre', window: '7:30pm-9:30pm', footTraffic: 'mid', source: 'theconcourse.com.au' },
  { dow: 5, emoji: '🛒', title: 'Chatswood Mall Markets · evening', venue: 'Chatswood Mall', window: '4pm-9pm', footTraffic: 'high', source: 'willoughby.nsw.gov.au' },
  { dow: 6, emoji: '👨‍👩‍👧', title: 'Family Day at Concourse', venue: 'The Concourse Civic Pavilion', window: '10am-3pm', footTraffic: 'high', source: 'theconcourse.com.au' },
  { dow: 0, emoji: '🛒', title: 'Chatswood Mall Markets', venue: 'Chatswood Mall', window: '9am-5pm', footTraffic: 'high', source: 'willoughby.nsw.gov.au' },
]

/**
 * Very-light HTML parser — finds heading-like text + date patterns.
 * For production, replace with cheerio/htmlparser2. For hackathon scope
 * this is enough to demonstrate real-fetch behavior.
 */
function extractEvents(html, source) {
  const out = []
  // Common event card patterns on Willoughby/Concourse sites
  const dateRe = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/gi
  const titleRe = /<h[23][^>]*>([^<]{6,80})<\/h[23]>/gi
  const titles = []
  let m
  while ((m = titleRe.exec(html)) !== null && titles.length < 12) {
    const t = m[1].replace(/\s+/g, ' ').trim()
    if (t && !t.toLowerCase().includes('cookie') && !t.toLowerCase().includes('menu')) titles.push(t)
  }
  const dates = []
  while ((m = dateRe.exec(html)) !== null && dates.length < 12) dates.push(m[0])

  // Pair titles with dates if we have matching length, otherwise just titles
  for (let i = 0; i < Math.min(titles.length, 6); i++) {
    out.push({
      title: titles[i],
      when: dates[i] || 'See website',
      source,
    })
  }
  return out
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'CattoCompass/1.0 (https://cattocompass.cattodata.com)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(id)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  // Serve from cache if fresh
  if (cache.data && Date.now() - cache.at < CACHE_TTL_MS) {
    return res.json({ ...cache.data, cached: true, ageMs: Date.now() - cache.at })
  }

  const results = { live: [], curated: FALLBACK_EVENTS, fetchedAt: new Date().toISOString(), sources: [] }

  // Try both feeds in parallel
  const [willoughby, concourse] = await Promise.allSettled([
    fetchWithTimeout(WILLOUGHBY_EVENTS_URL).then((html) => extractEvents(html, 'willoughby.nsw.gov.au')),
    fetchWithTimeout(CONCOURSE_EVENTS_URL).then((html) => extractEvents(html, 'theconcourse.com.au')),
  ])

  if (willoughby.status === 'fulfilled') {
    results.live.push(...willoughby.value)
    results.sources.push({ name: 'willoughby.nsw.gov.au', count: willoughby.value.length, ok: true })
  } else {
    results.sources.push({ name: 'willoughby.nsw.gov.au', ok: false, error: String(willoughby.reason).slice(0, 100) })
  }
  if (concourse.status === 'fulfilled') {
    results.live.push(...concourse.value)
    results.sources.push({ name: 'theconcourse.com.au', count: concourse.value.length, ok: true })
  } else {
    results.sources.push({ name: 'theconcourse.com.au', ok: false, error: String(concourse.reason).slice(0, 100) })
  }

  cache = { at: Date.now(), data: results }
  res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=3600')
  res.json({ ...results, cached: false })
}

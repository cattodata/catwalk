/**
 * Curated weekly Chatswood events.
 * Source: willoughby.nsw.gov.au/Things-to-do/Events + The Concourse program
 * (Real events from publicly listed council schedule.)
 *
 * V2: scrape the council events page nightly via Vercel cron.
 * For MVP this is hand-curated weekly to ensure quality + relevance.
 */
export interface ChatswoodEvent {
  /** 0=Sun..6=Sat */
  dow: number
  emoji: string
  title: string
  venue: string
  /** Time window e.g. "10am-2pm" */
  window?: string
  /** Estimated foot-traffic uplift to Chatswood CBD */
  footTraffic?: 'low' | 'mid' | 'high'
  /** Source URL (clickable in UI) */
  url?: string
}

export const WEEKLY_EVENTS: ChatswoodEvent[] = [
  {
    dow: 1,
    emoji: '📚',
    title: 'Library Storytime',
    venue: 'Willoughby City Library',
    window: '10:30am-11:00am',
    footTraffic: 'low',
    url: 'https://www.willoughby.nsw.gov.au/Library/Whats-on',
  },
  {
    dow: 2,
    emoji: '🎨',
    title: 'Concourse Art Lunch',
    venue: 'The Concourse',
    window: '12pm-1:30pm',
    footTraffic: 'mid',
    url: 'https://www.theconcourse.com.au/whats-on',
  },
  {
    dow: 3,
    emoji: '🛒',
    title: 'Chatswood Mall Markets',
    venue: 'Chatswood Mall (Victoria Ave)',
    window: '9am-5pm',
    footTraffic: 'high',
    url: 'https://www.willoughby.nsw.gov.au/Things-to-do/Chatswood-Mall-Markets',
  },
  {
    dow: 4,
    emoji: '🎭',
    title: 'Concourse Comedy Night',
    venue: 'The Concourse Theatre',
    window: '7:30pm-9:30pm',
    footTraffic: 'mid',
    url: 'https://www.theconcourse.com.au/whats-on',
  },
  {
    dow: 5,
    emoji: '🛒',
    title: 'Chatswood Mall Markets · evening',
    venue: 'Chatswood Mall',
    window: '4pm-9pm',
    footTraffic: 'high',
    url: 'https://www.willoughby.nsw.gov.au/Things-to-do/Chatswood-Mall-Markets',
  },
  {
    dow: 6,
    emoji: '👨‍👩‍👧',
    title: 'Family Day at Concourse',
    venue: 'The Concourse Civic Pavilion',
    window: '10am-3pm',
    footTraffic: 'high',
    url: 'https://www.theconcourse.com.au/whats-on',
  },
  {
    dow: 0,
    emoji: '🛒',
    title: 'Chatswood Mall Markets',
    venue: 'Chatswood Mall',
    window: '9am-5pm',
    footTraffic: 'high',
    url: 'https://www.willoughby.nsw.gov.au/Things-to-do/Chatswood-Mall-Markets',
  },
]

export function getTodayEvent(now: Date = new Date()): ChatswoodEvent | null {
  const dow = now.getDay()
  return WEEKLY_EVENTS.find((e) => e.dow === dow) ?? null
}

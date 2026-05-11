import { motion } from 'framer-motion'
import { CloudRain, Sun, Store, Users, CalendarDays, DollarSign } from 'lucide-react'
import type { WeatherSummary } from '../types/weather'
import type { CompetitorCounts } from '../lib/overpass'
import type { ChatswoodEvent } from '../data/events'

interface AbsDemographics {
  population: number
  chinese_ancestry_pct: number
  korean_ancestry_pct: number
}

interface Props {
  weather: WeatherSummary | null
  competitors: CompetitorCounts | null
  demographics: AbsDemographics | null
  todayEvent: ChatswoodEvent | null
  avgTicket?: number
}

/**
 * Real-time signals strip that demonstrates "Catto is listening" — shows the
 * raw data the AI is fusing right now. Makes the AI visible.
 */
export function LiveSignalsStrip({ weather, competitors, demographics, todayEvent, avgTicket = 15 }: Props) {
  const Cloud = weather?.isRain ? CloudRain : Sun
  const cityCafes = competitors?.cafes ?? 0
  const ancestryPct = demographics
    ? Math.round(demographics.chinese_ancestry_pct + demographics.korean_ancestry_pct)
    : 0

  const signals = [
    {
      icon: <Cloud size={13} strokeWidth={2.4} />,
      label: weather ? `${Math.round(weather.temp)}°C ${weather.isRain ? 'rain' : weather.label.split(' ')[0].toLowerCase()}` : '—',
      tone: weather?.isRain ? 'rain' : 'sun',
      title: weather?.label,
    },
    {
      icon: <Store size={13} strokeWidth={2.4} />,
      label: `${cityCafes} cafés in 700m`,
      tone: 'coral',
      title: `${competitors?.cafes ?? 0} cafes · ${competitors?.restaurants ?? 0} restaurants · ${competitors?.bakeries ?? 0} bakeries`,
    },
    {
      icon: <Users size={13} strokeWidth={2.4} />,
      label: `${ancestryPct}% multilingual`,
      tone: 'lavender',
      title: 'Chinese + Korean ancestry · ABS 2021',
    },
    {
      icon: <CalendarDays size={13} strokeWidth={2.4} />,
      label: todayEvent?.title ?? 'No event',
      tone: 'amber',
      title: todayEvent?.venue ?? 'Today',
    },
    {
      icon: <DollarSign size={13} strokeWidth={2.4} />,
      label: `$${avgTicket} avg ticket`,
      tone: 'sage',
      title: 'Average basket size',
    },
  ]

  return (
    <div className="cc-live-signals" role="list">
      <div className="cc-live-signals-head">
        <span className="cc-live-dot" aria-hidden="true" />
        <span>CATTO IS LISTENING · LIVE DATA</span>
      </div>
      <div className="cc-live-signals-row">
        {signals.map((s, i) => (
          <motion.div
            key={i}
            role="listitem"
            className={`cc-ls-chip cc-ls-${s.tone}`}
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 480, damping: 24 }}
            title={s.title ?? ''}
          >
            <span className="cc-ls-em" aria-hidden="true">{s.icon}</span>
            <span>{s.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

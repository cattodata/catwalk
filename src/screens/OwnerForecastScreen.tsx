import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Share2, Sparkles } from 'lucide-react'

import { BottomNav } from '../components/BottomNav'
import { SwitchRoleGear } from '../components/SwitchRoleSheet'
import { ForecastHero } from '../components/ForecastHero'
import { OpportunityScoreBar } from '../components/OpportunityScoreBar'
import { HourlyChartCard } from '../components/HourlyChartCard'
import { AbTestCard } from '../components/AbTestCard'
import { fetchAbForecast, type AbResult } from '../lib/ai-ab'
import { useWeather } from '../hooks/useWeather'
import { useNow } from '../hooks/useNow'

const BARS = [12, 24, 42, 55, 74, 50, 32, 28, 48, 96, 88, 42]
const PEAKS = [9, 10] // 5pm + 6pm

export function OwnerForecastScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { weather } = useWeather()
  const [ab, setAb] = useState<AbResult | null>(null)

  useEffect(() => {
    let live = true
    fetchAbForecast({
      bizType: 'Cafe',
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      shopName: 'Saint Honoré',
      weather: weather
        ? { temp: weather.temp, label: weather.label, isRain: weather.isRain }
        : undefined,
    }).then((r) => {
      if (live) setAb(r)
    })
    return () => {
      live = false
    }
  }, [now, weather])

  const witness = useMemo(() => {
    const parts: string[] = []
    if (weather?.isRain) parts.push('RAIN')
    parts.push('STATION PEAK')
    parts.push('LOW COMPETITORS @ 5PM')
    return parts.join(' · ')
  }, [weather])

  const chartContext = useMemo(() => {
    const parts: string[] = []
    if (weather?.isRain) parts.push('RAIN @5PM')
    parts.push('MARKETS')
    parts.push('SCHOOL HOLIDAY')
    return parts.join(' · ')
  }, [weather])

  return (
    <div className="cc-owner-forecast">
      <header className="cc-owner-bar">
        <div className="cc-owner-bar-title">
          <h2>Saint Honoré · Daily</h2>
        </div>
        <div className="cc-owner-bar-actions">
          <button type="button" className="cc-icon-btn" aria-label="Share">
            <Share2 size={18} aria-hidden="true" />
          </button>
          <SwitchRoleGear />
        </div>
      </header>

      <div className="cc-owner-body">
        <ForecastHero
          revenue={ab?.optionB.predRevenue ?? 285}
          orders={19}
          avgTicket={15}
          windowText="5–7PM"
          playName="Rainy Day Pour-Over Push"
          opportunityScore={96}
        />
        <OpportunityScoreBar score={96} witness={witness} />
        <HourlyChartCard title="Thursday · hourly" context={chartContext} bars={BARS} peakIndices={PEAKS} />
        <AbTestCard result={ab} />
        <button type="button" className="cc-owner-cta" onClick={() => navigate('/owner/campaign')}>
          <Sparkles size={16} strokeWidth={2.2} aria-hidden="true" />
          Generate today's play with photo →
        </button>
      </div>

      <div style={{ height: 72 }} aria-hidden="true" />
      <BottomNav />
    </div>
  )
}

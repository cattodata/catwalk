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

// Base hour-of-day profile (8am..7pm) — cafe-typical traffic curve
const BASE_BARS = [18, 28, 46, 60, 72, 50, 30, 26, 44, 78, 70, 38]

export function OwnerForecastScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { weather } = useWeather()
  const [ab, setAb] = useState<AbResult | null>(null)

  // Stable hour scalar so we don't refetch every minute (P1-13 / P1-16)
  const hour = now.getHours()
  const dayOfWeek = now.getDay()

  useEffect(() => {
    let live = true
    fetchAbForecast({
      bizType: 'Cafe',
      hour,
      dayOfWeek,
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
  }, [hour, dayOfWeek, weather])

  // Dynamic bars: rain → boost 4-6pm; sunny → flatten peak; weekend → shift later
  const { bars, peakIndices } = useMemo(() => {
    const rainBoost = weather?.isRain ? 22 : 0
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const out = BASE_BARS.map((v, i) => {
      let h = v
      const hourLabel = i + 8 // 8am at index 0
      if (weather?.isRain && hourLabel >= 16 && hourLabel <= 18) h += rainBoost
      if (isWeekend && hourLabel >= 10 && hourLabel <= 12) h += 12
      if (isWeekend && hourLabel >= 16) h -= 8
      return Math.max(8, Math.min(100, Math.round(h)))
    })
    // Mark top 2 hours as peak
    const sorted = out.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v)
    const peaks = sorted.slice(0, 2).map((x) => x.i)
    return { bars: out, peakIndices: peaks }
  }, [weather, dayOfWeek])

  // Opportunity score: function of weather (rain ↑), peak proximity, competitors
  const opportunityScore = useMemo(() => {
    let s = 60
    if (weather?.isRain) s += 18
    const distToPeak = Math.min(...peakIndices.map((p) => Math.abs(p + 8 - hour)))
    if (distToPeak <= 1) s += 14
    else if (distToPeak <= 2) s += 6
    if (hour >= 17 && hour <= 19) s += 6
    return Math.max(0, Math.min(100, s))
  }, [weather, hour, peakIndices])

  const witness = useMemo(() => {
    const parts: string[] = []
    if (weather?.isRain) parts.push('RAIN')
    if (Math.abs(peakIndices[0] + 8 - hour) <= 1) parts.push('PEAK WINDOW')
    parts.push('LOW COMPETITORS')
    return parts.join(' · ')
  }, [weather, hour, peakIndices])

  const chartContext = useMemo(() => {
    const parts: string[] = []
    if (weather?.isRain) parts.push('RAIN')
    if (dayOfWeek === 0 || dayOfWeek === 6) parts.push('WEEKEND')
    parts.push(weather?.label.toUpperCase() ?? 'CHATSWOOD')
    return parts.join(' · ')
  }, [weather, dayOfWeek])

  // Choose a play name that matches the conditions (no longer always "Rainy Day…")
  const playName = useMemo(() => {
    if (weather?.isRain) return 'Rainy Day Pour-Over Push'
    if (hour >= 17 && hour <= 19) return 'Evening Peak Spotlight'
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'Weekend Brunch Bundle'
    return 'Mid-Week Foot-Traffic Lift'
  }, [weather, hour, dayOfWeek])

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
          revenue={ab ? (ab.winner === 'a' ? ab.optionA.predRevenue : ab.optionB.predRevenue) : 285}
          orders={Math.round((ab?.optionB.predRevenue ?? 285) / 15)}
          avgTicket={15}
          windowText={`${(peakIndices[0] + 8) % 12 || 12}–${(peakIndices[1] + 8) % 12 || 12}PM`}
          playName={playName}
          opportunityScore={opportunityScore}
        />
        <OpportunityScoreBar score={opportunityScore} witness={witness} />
        <HourlyChartCard
          title={['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek] + ' · hourly'}
          context={chartContext}
          bars={bars}
          peakIndices={peakIndices}
        />
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

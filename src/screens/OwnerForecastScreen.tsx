import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Share2, Sparkles } from 'lucide-react'

import { BottomNav } from '../components/BottomNav'
import { SwitchRoleGear } from '../components/SwitchRoleSheet'
import { LiveSignalsStrip } from '../components/LiveSignalsStrip'
import { ClaudeReasoning } from '../components/ClaudeReasoning'
import { ForecastHero } from '../components/ForecastHero'
import { OpportunityScoreBar } from '../components/OpportunityScoreBar'
import { HourlyChartCard } from '../components/HourlyChartCard'
import { AbTestCard } from '../components/AbTestCard'
import { fetchAbForecast, type AbResult } from '../lib/ai-ab'
import { useWeather } from '../hooks/useWeather'
import { useCompetitorCounts } from '../hooks/useCompetitorCounts'
import { useDemographics } from '../hooks/useDemographics'
import { useNow } from '../hooks/useNow'
import { getActiveCity } from '../config/cities'
import { getTodayEvent } from '../data/events'

// Base hour-of-day profile (8am..7pm) — cafe-typical traffic curve
const BASE_BARS = [18, 28, 46, 60, 72, 50, 30, 26, 44, 78, 70, 38]

export function OwnerForecastScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { weather } = useWeather()
  const { counts: competitors } = useCompetitorCounts()
  const { demographics } = useDemographics()
  const [ab, setAb] = useState<AbResult | null>(null)
  const city = getActiveCity()
  const todayEvent = getTodayEvent(now)

  // Stable hour scalar so we don't refetch every minute
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
      const hourLabel = i + 8
      if (weather?.isRain && hourLabel >= 16 && hourLabel <= 18) h += rainBoost
      if (isWeekend && hourLabel >= 10 && hourLabel <= 12) h += 12
      if (isWeekend && hourLabel >= 16) h -= 8
      return Math.max(8, Math.min(100, Math.round(h)))
    })
    const sorted = out.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v)
    const peaks = sorted.slice(0, 2).map((x) => x.i)
    return { bars: out, peakIndices: peaks }
  }, [weather, dayOfWeek])

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
    parts.push(weather?.label.toUpperCase() ?? city.name.toUpperCase())
    return parts.join(' · ')
  }, [weather, dayOfWeek, city.name])

  const playName = useMemo(() => {
    if (weather?.isRain) return 'Rainy Day Pour-Over Push'
    if (hour >= 17 && hour <= 19) return 'Evening Peak Spotlight'
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'Weekend Brunch Bundle'
    return 'Mid-Week Foot-Traffic Lift'
  }, [weather, hour, dayOfWeek])

  // Build the reasoning chain from real signals (each row shows a signal → inference → source)
  const reasoning = useMemo(() => {
    const rows: { signal: string; inference: string; source: string }[] = []
    if (weather) {
      rows.push({
        signal: `${weather.label}, ${Math.round(weather.temp)}°C`,
        inference: weather.isRain ? 'coffee jumps +32% next hour' : 'iced-drink window 2-4pm',
        source: 'Open-Meteo',
      })
    }
    if (competitors) {
      rows.push({
        signal: `${competitors.cafes} cafés within 700m`,
        inference:
          competitors.cafes >= 20
            ? 'saturated — differentiate on hero product'
            : 'thin market — discount sells volume',
        source: 'OSM Overpass',
      })
    }
    if (demographics) {
      const cn = Math.round(demographics.chinese_ancestry_pct)
      const ko = Math.round(demographics.korean_ancestry_pct)
      rows.push({
        signal: `${cn}% Chinese · ${ko}% Korean ancestry`,
        inference: 'trilingual caption · share-friendly',
        source: 'ABS 2021 Census',
      })
    }
    if (todayEvent) {
      rows.push({
        signal: todayEvent.title,
        inference: `${todayEvent.footTraffic === 'high' ? 'high' : 'mid'} foot-traffic at ${todayEvent.venue}`,
        source: `${city.council} schedule`,
      })
    }
    rows.push({
      signal: `Peak ${(peakIndices[0] + 8) % 12 || 12}-${(peakIndices[1] + 8) % 12 || 12}PM today`,
      inference: 'time the offer for window 2',
      source: 'Hourly model · weather × event',
    })
    return rows
  }, [weather, competitors, demographics, todayEvent, peakIndices, city.council])

  const conclusion = useMemo(() => {
    if (weather?.isRain) return 'Push pour-over with free croissant 5–7pm. Indoor seating angle.'
    if (hour >= 17) return 'Spotlight the evening peak with bundle — small offer beats deep discount.'
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'Lean into weekend brunch — share-friendly trilingual social.'
    return 'Mid-week foot-traffic lift via loyalty bundle, not discount.'
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
        {/* AI-visible top: live signals → reasoning chain → recommendation */}
        <LiveSignalsStrip
          weather={weather}
          competitors={competitors}
          demographics={demographics ? {
            population: demographics.population,
            chinese_ancestry_pct: demographics.chinese_ancestry_pct,
            korean_ancestry_pct: demographics.korean_ancestry_pct,
          } : null}
          todayEvent={todayEvent}
        />
        <ClaudeReasoning
          reasons={reasoning}
          conclusion={conclusion}
          source={ab?.source}
        />

        {/* Primary CTA — make the wow flow obvious */}
        <button type="button" className="cc-owner-cta" onClick={() => navigate('/owner/campaign')}>
          <Sparkles size={16} strokeWidth={2.2} aria-hidden="true" />
          Generate trilingual campaign with a photo →
        </button>

        {/* Deeper view below the fold */}
        <h3 className="cc-owner-section-h">Today's forecast</h3>
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
      </div>

      <div style={{ height: 72 }} aria-hidden="true" />
      <BottomNav />
    </div>
  )
}

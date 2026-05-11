import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { BottomNav } from '../components/BottomNav'
import { SwitchRoleGear } from '../components/SwitchRoleSheet'
import { CattoPill } from '../components/CattoPill'
import { ForecastHero } from '../components/ForecastHero'
import { OpportunityScoreBar } from '../components/OpportunityScoreBar'
import { HourlyChartCard } from '../components/HourlyChartCard'
import { AbTestCard } from '../components/AbTestCard'
import { fetchAbForecast, type AbResult } from '../lib/ai-ab'
import { useWeather } from '../hooks/useWeather'
import { useNow } from '../hooks/useNow'

const BASE_BARS = [18, 28, 46, 60, 72, 50, 30, 26, 44, 78, 70, 38]

export function OwnerForecastScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { weather } = useWeather()
  const [ab, setAb] = useState<AbResult | null>(null)
  const [deepOpen, setDeepOpen] = useState(false)

  const hour = now.getHours()
  const dayOfWeek = now.getDay()

  useEffect(() => {
    let live = true
    fetchAbForecast({
      bizType: 'Cafe',
      hour,
      dayOfWeek,
      shopName: 'Saint Honoré',
      weather: weather ? { temp: weather.temp, label: weather.label, isRain: weather.isRain } : undefined,
    }).then((r) => {
      if (live) setAb(r)
    })
    return () => {
      live = false
    }
  }, [hour, dayOfWeek, weather])

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

  const playName = useMemo(() => {
    if (weather?.isRain) return 'Rainy Day Pour-Over Push'
    if (hour >= 17 && hour <= 19) return 'Evening Peak Spotlight'
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'Weekend Brunch Bundle'
    return 'Mid-Week Foot-Traffic Lift'
  }, [weather, hour, dayOfWeek])

  // 1-sentence proactive prompt — the SINGLE AI moment
  const prompt = useMemo(() => {
    const parts: { lead: string; mark: string; tail: string } = weather?.isRain
      ? { lead: 'It rains at ', mark: `${(hour + 1) % 24}:30`, tail: '. Want a 2-hour push to walkers nearby?' }
      : hour >= 16
      ? { lead: 'Station peak in ', mark: '22 min', tail: '. Want a flash offer for commuters?' }
      : { lead: 'Lunch peak today is ', mark: `${(peakIndices[0] + 8) % 12 || 12}–${(peakIndices[1] + 8) % 12 || 12}pm`, tail: '. Ship a 30-min trilingual push?' }
    return parts
  }, [weather, hour, peakIndices])

  // Yesterday's takings stat (deterministic from AB winner number, jittered by day)
  const yesterdayRev = useMemo(() => 245 + ((dayOfWeek * 13) % 90), [dayOfWeek])

  return (
    <div className="cc-owner-forecast">
      <header className="cc-owner-bar">
        <div className="cc-owner-bar-title">
          <h2>Saint Honoré · Daily</h2>
        </div>
        <div className="cc-owner-bar-actions">
          <SwitchRoleGear />
        </div>
      </header>

      <div className="cc-owner-v5">
        {/* 1 stat hero — yesterday's takings */}
        <div className="cc-stat-card">
          <div className="cc-stat-card-lab">YESTERDAY · LUNCH</div>
          <div className="cc-stat-card-num">+${yesterdayRev}</div>
          <div className="cc-stat-card-delta">
            <b>+19 orders</b> · 12% vs. avg
          </div>
          <div className="cc-stat-card-mini-chart" aria-hidden="true">
            <div className="b" style={{ height: '38%' }} />
            <div className="b" style={{ height: '50%' }} />
            <div className="b" style={{ height: '62%' }} />
            <div className="b" style={{ height: '48%' }} />
            <div className="b" style={{ height: '74%' }} />
            <div className="b" style={{ height: '88%' }} />
            <div className="b now" style={{ height: '100%' }} />
          </div>
        </div>

        {/* SINGLE AI moment — dark CTA card */}
        <div className="cc-ai-cta">
          <CattoPill tone="light" className="cc-ai-cta-pill">
            CATTO READY
          </CattoPill>
          <p className="cc-ai-cta-q">
            {prompt.lead}
            <mark>{prompt.mark}</mark>
            {prompt.tail}
          </p>
          <button type="button" className="cc-ai-cta-btn" onClick={() => navigate('/owner/campaign')}>
            Generate today's play <span className="arr">→</span>
          </button>
        </div>

        {/* Deeper view — collapsed by default to keep the home glanceable */}
        <button
          type="button"
          className="cc-owner-deep-toggle"
          onClick={() => setDeepOpen((s) => !s)}
        >
          {deepOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {deepOpen ? 'Hide forecast detail' : 'Show forecast detail'}
        </button>
        {deepOpen && (
          <>
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
              title={
                ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek] +
                ' · hourly'
              }
              context={witness}
              bars={bars}
              peakIndices={peakIndices}
            />
            <AbTestCard result={ab} />
          </>
        )}
      </div>

      <div style={{ height: 72 }} aria-hidden="true" />
      <BottomNav />
    </div>
  )
}

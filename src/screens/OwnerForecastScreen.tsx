import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudRain, Cloud, Store, Users, CalendarDays } from 'lucide-react'

import { BottomNav } from '../components/BottomNav'
import { SwitchRoleGear } from '../components/SwitchRoleSheet'
import { CattoPill } from '../components/CattoPill'
import { OwnerReading } from '../components/OwnerReading'
import { useWeather } from '../hooks/useWeather'
import { useCompetitorCounts } from '../hooks/useCompetitorCounts'
import { useDemographics } from '../hooks/useDemographics'
import { useNow } from '../hooks/useNow'
import { getTodayEvent } from '../data/events'

/**
 * v5.2 — Owner home now shows AI signals inline (OwnerReading)
 * instead of duplicating across chip strip + reasoning panel. Dark
 * CTA card carries the concrete play recommendation, not a vague
 * question. One Generate button lives inside the dark card.
 */
export function OwnerForecastScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { weather } = useWeather()
  const { counts: competitors } = useCompetitorCounts()
  const { demographics } = useDemographics()
  const todayEvent = getTodayEvent(now)
  const hour = now.getHours()
  const dayOfWeek = now.getDay()

  // 4 inline signal rows — each carries its conclusion alongside the raw fact
  const readingRows = useMemo(() => {
    const rows = []
    const RainIcon = weather?.isRain ? CloudRain : Cloud
    rows.push({
      icon: <RainIcon size={16} strokeWidth={2.2} aria-hidden="true" />,
      signal: weather
        ? `${Math.round(weather.temp)}°C ${weather.isRain ? 'rain' : weather.label.toLowerCase()}`
        : 'live conditions',
      conclusion: weather?.isRain ? (
        <>coffee jumps <mark>+32%</mark> in 30 min</>
      ) : (
        <>iced-drink window <mark>2–4PM</mark></>
      ),
    })
    rows.push({
      icon: <Store size={16} strokeWidth={2.2} aria-hidden="true" />,
      signal: `${competitors?.cafes ?? 0} cafés within 700m`,
      conclusion:
        (competitors?.cafes ?? 0) >= 20 ? (
          <>differentiate on hero product</>
        ) : (
          <>thin market — discount sells volume</>
        ),
    })
    if (demographics) {
      const cn = Math.round(demographics.chinese_ancestry_pct)
      const ko = Math.round(demographics.korean_ancestry_pct)
      rows.push({
        icon: <Users size={16} strokeWidth={2.2} aria-hidden="true" />,
        signal: `${cn}% Chinese · ${ko}% Korean nearby`,
        conclusion: <>trilingual <mark>signage gap</mark></>,
      })
    } else {
      rows.push({
        icon: <Users size={16} strokeWidth={2.2} aria-hidden="true" />,
        signal: '41% Chinese · 8% Korean nearby',
        conclusion: <>trilingual <mark>signage gap</mark></>,
      })
    }
    if (todayEvent) {
      rows.push({
        icon: <CalendarDays size={16} strokeWidth={2.2} aria-hidden="true" />,
        signal: todayEvent.title + ' today',
        conclusion: (
          <>
            peak walk-by <mark>{todayEvent.window?.replace('-', '–') ?? '5–6PM'}</mark>
          </>
        ),
      })
    }
    return rows.slice(0, 4)
  }, [weather, competitors, demographics, todayEvent])

  // Concrete play recommendation in the dark CTA card (not a vague question)
  const play = useMemo(() => {
    if (weather?.isRain) {
      return {
        body: (
          <>
            Bundle <mark>croissant + flat white</mark> at $9 with EN · 中文 · 한국어 signage.
            Push <mark>11:30–13:30</mark> before rain.
          </>
        ),
      }
    }
    if (hour >= 16 && hour <= 18) {
      return {
        body: (
          <>
            Spotlight <mark>evening peak 5–7PM</mark> with a $5 single-origin pour-over flash. Trilingual social push.
          </>
        ),
      }
    }
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        body: (
          <>
            Weekend brunch bundle <mark>11–1PM</mark>: croissant + iced latte $11. Korean caption tested last week.
          </>
        ),
      }
    }
    return {
      body: (
        <>
          Mid-week loyalty bundle <mark>12–1PM</mark>: croissant + flat white $9, free top-up on 3rd visit.
        </>
      ),
    }
  }, [weather, hour, dayOfWeek])

  const yesterdayRev = useMemo(() => 245 + ((dayOfWeek * 13) % 90), [dayOfWeek])

  return (
    <div className="cc-owner-forecast">
      <header className="cc-owner-bar">
        <div className="cc-owner-bar-title">
          <h2>Saint Honoré</h2>
          <small>Yesterday's takings</small>
        </div>
        <div className="cc-owner-bar-actions">
          <SwitchRoleGear />
        </div>
      </header>

      <div className="cc-owner-v5">
        {/* 1) Stat hero — yesterday's takings */}
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

        {/* 2) Reading now — inline signal → conclusion (the AI's working memory) */}
        <OwnerReading rows={readingRows} />

        {/* 3) AI CTA — concrete play recommendation + Generate inside the card */}
        <div className="cc-ai-cta">
          <CattoPill tone="light" className="cc-ai-cta-pill">
            CATTO READY
          </CattoPill>
          <p className="cc-ai-cta-q">{play.body}</p>
          <button type="button" className="cc-ai-cta-btn-v52" onClick={() => navigate('/owner/campaign')}>
            Generate today's play <span className="arr">→</span>
          </button>
        </div>
      </div>

      <div style={{ height: 72 }} aria-hidden="true" />
      <BottomNav />
    </div>
  )
}

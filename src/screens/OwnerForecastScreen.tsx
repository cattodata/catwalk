import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/BottomNav'
import { SwitchRoleGear } from '../components/SwitchRoleSheet'
import { CattoPill } from '../components/CattoPill'
import { useWeather } from '../hooks/useWeather'
import { useNow } from '../hooks/useNow'

/**
 * v5 strict — single AI moment per screen.
 * Owner Home = 1 stat hero ("Yesterday · lunch +$N") + 1 dark CATTO READY
 * ai-cta with proactive prompt. No bar chart, no A/B, no opportunity score,
 * no signal grid. Deeper insight lives inside /owner/campaign result step.
 */
export function OwnerForecastScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { weather } = useWeather()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()

  // 1-sentence proactive prompt — the AI moment
  const prompt = useMemo(() => {
    if (weather?.isRain) {
      const minOfHour = (hour + 1) % 24
      return {
        lead: 'It rains at ',
        mark: `${minOfHour}:30`,
        tail: '. Want a 2-hour push to walkers nearby?',
      }
    }
    if (hour >= 16 && hour <= 18) {
      return {
        lead: 'Station peak in ',
        mark: '22 min',
        tail: '. Want a flash offer for commuters?',
      }
    }
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        lead: 'Weekend brunch peak ',
        mark: '11–1pm',
        tail: '. Ship a trilingual social push?',
      }
    }
    return {
      lead: 'Lunch peak today is ',
      mark: '12–1pm',
      tail: '. Ship a 30-min trilingual push?',
    }
  }, [weather, hour, dayOfWeek])

  // Yesterday's takings — deterministic but varies by day
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
      </div>

      <div style={{ height: 72 }} aria-hidden="true" />
      <BottomNav />
    </div>
  )
}

import { useMemo } from 'react'
import type { BizType } from '../types/shop'
import type { WeatherSummary } from '../types/weather'

interface DemandForecastProps {
  bizType: BizType
  weather: WeatherSummary | null
  /** 0=Sun..6=Sat */
  dayOfWeek: number
  currentHour: number
}

/**
 * 24-hour demand forecast bar chart.
 *
 * Model = real signals × hard-coded peaks per business type.
 * Inputs:
 *   - TfNSW Opal commuter waves: 7-9 morning peak, 17-19 evening peak (constant)
 *   - Day of week: Mon-Fri commuter, Sat retail, Sun markets
 *   - Weather: rain dampens evening, hot boosts cold drinks lunchtime
 *   - BizType: Bakery=morning, Cafe=morning+arvo, Restaurant=lunch+evening
 *
 * Output: 24-element array, value 0..1 = relative demand.
 */
function predictDemand(bizType: BizType, weather: WeatherSummary | null, dow: number): number[] {
  const isWeekend = dow === 0 || dow === 6
  const out = new Array(24).fill(0) as number[]

  for (let h = 0; h < 24; h++) {
    let v = 0.05

    // Commuter waves (weekdays)
    if (!isWeekend) {
      if (h >= 7 && h <= 9) v += 0.55 // morning Opal
      else if (h >= 17 && h <= 19) v += 0.50 // evening Opal
    }

    // Lunch peak everyone
    if (h >= 11 && h <= 13) v += 0.30
    // Dinner peak
    if (h >= 18 && h <= 20) v += 0.40

    // Bizz type-specific weighting
    if (bizType === 'Bakery') {
      if (h >= 6 && h <= 10) v += 0.40
      if (h >= 16) v *= 0.7 // bakeries close earlier
    } else if (bizType === 'Cafe') {
      if (h >= 8 && h <= 11) v += 0.30
      if (h >= 14 && h <= 16) v += 0.20 // arvo coffee
    } else if (bizType === 'Restaurant') {
      if (h >= 11 && h <= 14) v += 0.30 // lunch service
      if (h >= 18 && h <= 21) v += 0.40 // dinner
    }

    // Weekend retail surge
    if (isWeekend) {
      if (h >= 10 && h <= 16) v += 0.35
    }

    // Weather modifier
    if (weather?.isRain) {
      v *= 0.9 // overall slight dampener
      if ((bizType === 'Cafe' || bizType === 'Bakery') && h >= 14 && h <= 17) {
        v *= 1.2 // cosy indoor afternoon boost
      }
    }
    if (weather?.isHot && bizType === 'Cafe' && h >= 11 && h <= 16) {
      v *= 1.15 // cold drinks lunchtime
    }

    out[h] = Math.min(1, v)
  }

  // Normalize to 0..1 with peak at 1
  const max = Math.max(...out, 0.01)
  return out.map((v) => v / max)
}

export function DemandForecast({ bizType, weather, dayOfWeek, currentHour }: DemandForecastProps) {
  const demand = useMemo(() => predictDemand(bizType, weather, dayOfWeek), [bizType, weather, dayOfWeek])
  const peakHour = demand.indexOf(Math.max(...demand))
  const peakWindow = (() => {
    const start = Math.max(0, peakHour - 1)
    const end = Math.min(23, peakHour + 1)
    return `${formatHour(start)}–${formatHour(end + 1)}`
  })()

  return (
    <div className="cc-card cc-demand-card">
      <div className="ins-head">
        <h2>📊 Today's demand forecast</h2>
        <span className="cc-eyebrow" style={{ fontSize: 10, opacity: 0.7 }}>
          model · live
        </span>
      </div>
      <div className="cc-demand-sub">
        Peak window: <b>{peakWindow}</b>{' '}
        <span style={{ opacity: 0.6 }}>· based on Opal commuter waves + weather + your business type</span>
      </div>
      <div className="cc-demand-chart" role="img" aria-label={`Demand chart, peak at ${formatHour(peakHour)}`}>
        {demand.map((v, h) => {
          const isCurrent = h === currentHour
          const isPeak = h === peakHour
          return (
            <div
              key={h}
              className={`cc-demand-bar ${isCurrent ? 'is-current' : ''} ${isPeak ? 'is-peak' : ''}`}
              style={{
                height: `${4 + v * 56}px`,
                background: isPeak
                  ? 'linear-gradient(180deg, #FF6B9D, #F5C842)'
                  : isCurrent
                    ? '#5B9BD5'
                    : 'rgba(154,128,90,0.32)',
              }}
              title={`${formatHour(h)}: ${(v * 100).toFixed(0)}% of peak`}
            />
          )
        })}
      </div>
      <div className="cc-demand-axis">
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>11pm</span>
      </div>
    </div>
  )
}

function formatHour(h: number): string {
  const hh = h % 24
  if (hh === 0) return '12am'
  if (hh === 12) return '12pm'
  if (hh < 12) return `${hh}am`
  return `${hh - 12}pm`
}

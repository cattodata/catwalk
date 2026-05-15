import { useMemo, useState } from 'react'
import { ChevronDown, Sparkles, ArrowRight } from 'lucide-react'
import type { Shop, TransportId } from '../types/shop'
import { TRANSPORT } from '../data/shops'

interface Props {
  shop: Shop
  reasons?: string[]
  isRain?: boolean
  onPick: (mode: TransportId) => void
}

interface RankedMode {
  id: TransportId
  emoji: string
  label: string
  etaMin: number
  costSaved: number
  co2Kg: number
  score: number
  availability: 'high' | 'med' | 'low'
  hint: string
}

const AVAILABILITY: Record<TransportId, 'high' | 'med' | 'low'> = {
  walk: 'high',
  bike: 'med',
  scoot: 'low',
  bus: 'high',
  ev: 'med',
}

function rankModes(walkMin: number, baseCo2: number, isRain: boolean): RankedMode[] {
  return TRANSPORT.map((t) => {
    const eta = Math.max(1, Math.round(walkMin * t.speed))
    const co2 = +(baseCo2 * t.co2Mult).toFixed(2)
    const costSaved = +(t.driveCost * (1 - t.co2Mult * 0.3)).toFixed(2)
    let score = Math.round(140 - eta * 5 - co2 * 320 + costSaved * 4 + t.ptsMult * 18)
    if (isRain && (t.id === 'bike' || t.id === 'scoot')) score -= 35
    if (isRain && (t.id === 'bus' || t.id === 'ev')) score += 15
    return {
      id: t.id,
      emoji: t.emoji,
      label: t.label,
      etaMin: eta,
      costSaved,
      co2Kg: co2,
      score,
      availability: AVAILABILITY[t.id],
      hint: t.hint,
    }
  }).sort((a, b) => b.score - a.score)
}

export function MultiModalOptimizer({ shop, reasons = [], isRain = false, onPick }: Props) {
  const [open, setOpen] = useState(false)
  const ranked = useMemo(
    () => rankModes(shop.mins ?? 4, shop.co2 ?? 0.05, isRain),
    [shop, isRain],
  )
  const top = ranked[0]
  const rest = ranked.slice(1)

  return (
    <div className={`cc-mmo${open ? ' is-open' : ''}`}>
      <button type="button" className="cc-mmo-top" onClick={() => onPick(top.id)}>
        <span className="cc-mmo-ic" aria-hidden="true">
          <Sparkles size={16} strokeWidth={2.2} />
        </span>
        <span className="cc-mmo-body">
          <span className="cc-mmo-lab">
            <span aria-hidden="true">{top.emoji}</span>
            <b>Catto Wheels</b> · {top.label}
          </span>
          <small>
            {top.etaMin} min · ${top.costSaved} saved · {top.co2Kg} kg CO₂ · {shop.name}
          </small>
        </span>
        <span className="cc-mmo-arr" aria-hidden="true">
          <ArrowRight size={16} strokeWidth={2.4} />
        </span>
      </button>
      <button
        type="button"
        className="cc-mmo-more"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="cc-mmo-list"
      >
        <span>{open ? 'hide ranked' : `compare ${rest.length} more modes`}</span>
        <ChevronDown size={13} strokeWidth={2.4} aria-hidden="true" />
      </button>
      {open && (
        <ul id="cc-mmo-list" className="cc-mmo-list">
          {rest.map((m, i) => (
            <li key={m.id}>
              <button type="button" className="cc-mmo-row" onClick={() => onPick(m.id)}>
                <span className="cc-mmo-row-rank">#{i + 2}</span>
                <span className="cc-mmo-row-emo" aria-hidden="true">
                  {m.emoji}
                </span>
                <span className="cc-mmo-row-lab">{m.label}</span>
                <span className="cc-mmo-row-meta">
                  {m.etaMin}m · {m.co2Kg}kg
                </span>
                <span
                  className={`cc-mmo-row-av av-${m.availability}`}
                  aria-label={`${m.availability} availability`}
                  title={m.hint}
                />
              </button>
            </li>
          ))}
          {reasons.length > 0 && (
            <li className="cc-mmo-why">
              <span className="cc-mmo-why-h">Catto reasoned</span>
              {reasons.map((r, i) => (
                <span key={i} className="cc-mmo-why-r">
                  · {r}
                </span>
              ))}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

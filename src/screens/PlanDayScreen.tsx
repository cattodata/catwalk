import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Footprints, Leaf, Coins, ArrowRight } from 'lucide-react'

import { BottomNav } from '../components/BottomNav'
import { CattoPill } from '../components/CattoPill'
import { useRealShops } from '../hooks/useRealShops'
import { useGeolocation } from '../hooks/useGeolocation'
import { computePlanTotals, DAY_PRESETS, buildDayFromPreset } from '../lib/planMath'
import type { Shop } from '../types/shop'

export function PlanDayScreen() {
  const navigate = useNavigate()
  const { shops } = useRealShops()
  const geo = useGeolocation(true)
  const origin = geo.position ? { lat: geo.position.lat, lng: geo.position.lng } : null

  const [stops, setStops] = useState<Shop[]>([])
  const [picking, setPicking] = useState(false)
  const totals = useMemo(() => computePlanTotals(stops, origin), [stops, origin])

  const remainingShops = useMemo(
    () => shops.filter((s) => !stops.some((p) => p.id === s.id)),
    [shops, stops],
  )

  const onPreset = (presetId: string) => {
    const preset = DAY_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setStops(buildDayFromPreset(preset, shops))
  }

  const onAddStop = (shop: Shop) => {
    setStops((cur) => [...cur, shop])
    setPicking(false)
  }

  const onRemoveStop = (id: string) => {
    setStops((cur) => cur.filter((s) => s.id !== id))
  }

  const onStartDay = () => {
    if (stops.length === 0) return
    sessionStorage.setItem('cc:plan', JSON.stringify({ stopIds: stops.map((s) => s.id), index: 0 }))
    sessionStorage.setItem('cc:selectedShopId', stops[0].id)
    sessionStorage.setItem('cc:transport', 'walk')
    navigate('/walk/live')
  }

  return (
    <div className="cc-plan-screen">
      <header className="cc-plan-bar">
        <button
          type="button"
          className="cc-plan-back"
          aria-label="Back"
          onClick={() => navigate('/walk')}
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>
        <div className="cc-plan-bar-title">
          <span className="cc-plan-bar-h">Plan a day</span>
          <span className="cc-plan-bar-sub">Chain stops · skip the car</span>
        </div>
      </header>

      <section className="cc-plan-intro">
        <CattoPill tone="dark">PLAN-THE-DAY · BETA</CattoPill>
        <h3>Make a day out of it.</h3>
        <p>Pick 2–4 stops. We'll show what you save vs driving — and chain 3+ for a bonus.</p>
      </section>

      {/* presets */}
      <div className="cc-plan-presets" role="group" aria-label="Day presets">
        {DAY_PRESETS.map((p) => (
          <button key={p.id} type="button" className="cc-plan-preset" onClick={() => onPreset(p.id)}>
            <span className="cc-plan-preset-em" aria-hidden="true">{p.emoji}</span>
            <span className="cc-plan-preset-body">
              <span className="cc-plan-preset-lab">{p.label}</span>
              <small>{p.hint}</small>
            </span>
          </button>
        ))}
      </div>

      {/* stops */}
      <section className="cc-plan-stops" aria-label="Stops">
        <header>
          <span className="cc-plan-stops-h">YOUR DAY</span>
          <span className="cc-plan-stops-c">{stops.length} stop{stops.length === 1 ? '' : 's'}</span>
        </header>

        {stops.length === 0 ? (
          <div className="cc-plan-empty">
            <p>No stops yet. Try a preset above, or add one below.</p>
          </div>
        ) : (
          <ol className="cc-plan-list">
            {stops.map((s, i) => (
              <li key={s.id} className="cc-plan-row">
                <span className="cc-plan-row-n">{i + 1}</span>
                <span className="cc-plan-row-em" aria-hidden="true">{s.emoji}</span>
                <span className="cc-plan-row-body">
                  <span className="cc-plan-row-name">{s.name}</span>
                  <small>{s.dist}m · {Math.max(1, Math.round(s.dist / 75))} min · {s.pts} pts</small>
                </span>
                <button
                  type="button"
                  className="cc-plan-row-x"
                  onClick={() => onRemoveStop(s.id)}
                  aria-label={`Remove ${s.name}`}
                >
                  <X size={14} strokeWidth={2.4} />
                </button>
              </li>
            ))}
          </ol>
        )}

        {stops.length < 4 && (
          <button
            type="button"
            className="cc-plan-add"
            onClick={() => setPicking(true)}
            disabled={remainingShops.length === 0}
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>Add a stop</span>
          </button>
        )}
      </section>

      {/* totals + start */}
      {stops.length > 0 && (
        <section className="cc-plan-totals" aria-label="Day totals">
          <header>
            <span className="cc-plan-totals-h">WHAT YOU SAVE</span>
            {totals.chainBonus > 1 && (
              <span className="cc-plan-bonus">CHAIN BONUS ×{totals.chainBonus}</span>
            )}
          </header>
          <div className="cc-plan-totals-grid">
            <div>
              <span className="cc-plan-totals-ic" aria-hidden="true"><Footprints size={14} strokeWidth={2.2} /></span>
              <div className="cc-plan-totals-v">{totals.walkMins} min</div>
              <div className="cc-plan-totals-l">WALK</div>
            </div>
            <div>
              <span className="cc-plan-totals-ic" aria-hidden="true"><Leaf size={14} strokeWidth={2.2} /></span>
              <div className="cc-plan-totals-v">{totals.co2KgSaved.toFixed(2)}kg</div>
              <div className="cc-plan-totals-l">CO₂ vs CAR</div>
            </div>
            <div>
              <span className="cc-plan-totals-ic" aria-hidden="true"><Coins size={14} strokeWidth={2.2} /></span>
              <div className="cc-plan-totals-v">${totals.parkingSavedAud.toFixed(0)}</div>
              <div className="cc-plan-totals-l">PARKING</div>
            </div>
          </div>
          <button type="button" className="cc-plan-start" onClick={onStartDay}>
            <span>Start day · earn {totals.points} pts</span>
            <ArrowRight size={16} strokeWidth={2.4} />
          </button>
        </section>
      )}

      {/* shop picker sheet */}
      {picking && (
        <div className="cc-plan-picker-veil" onClick={() => setPicking(false)}>
          <div className="cc-plan-picker" onClick={(e) => e.stopPropagation()}>
            <header>
              <span className="cc-plan-picker-h">Add a stop</span>
              <button
                type="button"
                className="cc-plan-picker-x"
                onClick={() => setPicking(false)}
                aria-label="Close"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </header>
            <ul className="cc-plan-picker-list">
              {remainingShops.slice(0, 12).map((s) => (
                <li key={s.id}>
                  <button type="button" className="cc-plan-picker-row" onClick={() => onAddStop(s)}>
                    <span className="cc-plan-picker-em" aria-hidden="true">{s.emoji}</span>
                    <span className="cc-plan-picker-body">
                      <span>{s.name}</span>
                      <small>{s.dist}m · {s.pts} pts · {s.off}% off</small>
                    </span>
                    <Plus size={14} strokeWidth={2.4} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div style={{ height: 72 }} aria-hidden="true" />
      <BottomNav />
    </div>
  )
}

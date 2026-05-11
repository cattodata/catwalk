import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Footprints, Bike, TrainFront } from 'lucide-react'
import type { TransportId } from '../types/shop'
import { TRANSPORT } from '../data/shops'

const ICONS = { walk: Footprints, bike: Bike, bus: TrainFront } as const
const SHOWN: TransportId[] = ['walk', 'bike', 'bus']

interface Props {
  active: TransportId
  onChange: (id: TransportId) => void
  /** Walk-time minutes basis. Used to scale per-mode ETA via speed mult. */
  walkMin?: number
  /** Base points (typically `shop.pts`) — scaled by each mode's ptsMult */
  basePts?: number
  /** Base CO₂ saved (typically `shop.co2`) — scaled by each mode's co2Mult */
  baseCo2?: number
}

/**
 * Living-tradeoff transport selector. Tapping a mode snaps the pill, and the
 * 4-cell readout strip below (PTS / KG CO₂ / MIN / SAVED) re-renders with a
 * 40ms-stagger spring — the user FEELS the tradeoff, not just reads it.
 */
export function TransportModesRow({
  active,
  onChange,
  walkMin = 4,
  basePts = 180,
  baseCo2 = 0.05,
}: Props) {
  const modes = useMemo(
    () => SHOWN.map((id) => TRANSPORT.find((t) => t.id === id)).filter(Boolean) as typeof TRANSPORT,
    [],
  )
  const cur = modes.find((m) => m.id === active) ?? modes[0]

  const pts = Math.round(basePts * cur.ptsMult)
  const co2 = (baseCo2 * cur.co2Mult).toFixed(2)
  const eta = Math.max(1, Math.round(walkMin * cur.speed))
  const save = cur.driveCost.toFixed(2)

  return (
    <div className="cc-tm">
      <div className="cc-tm-row" role="radiogroup" aria-label="Transport mode">
        {modes.map((m) => {
          const Icon = ICONS[m.id as keyof typeof ICONS]
          const on = m.id === active
          const dots = m.ptsMult >= 0.9 ? 3 : m.ptsMult >= 0.7 ? 2 : 1
          return (
            <motion.button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`cc-tm-pill${on ? ' is-on' : ''}`}
              onClick={() => onChange(m.id)}
              whileTap={{ scale: 0.94 }}
              animate={{ y: on ? -2 : 0 }}
              transition={{ type: 'spring', stiffness: 480, damping: 26 }}
            >
              <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
              <span className="cc-tm-l">{m.id === 'bus' ? 'Train' : m.label}</span>
              <span className="cc-tm-x">
                {m.ptsMult.toFixed(2).replace(/0$/, '')}×
                <i className={`cc-tm-d d${dots}`} aria-hidden="true" />
              </span>
            </motion.button>
          )
        })}
      </div>

      <motion.div
        className="cc-tm-strip"
        layout
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <AnimatePresence mode="popLayout">
          {[
            { k: `p${active}`, v: pts, s: 'PTS', tone: 'coral' },
            { k: `c${active}`, v: co2, s: 'KG CO₂', tone: 'sage' },
            { k: `e${active}`, v: eta, s: 'MIN', tone: 'ink' },
            { k: `s${active}`, v: `$${save}`, s: 'SAVED', tone: 'amber' },
          ].map((x, i) => (
            <motion.div
              key={x.k}
              className={`cc-tm-cell t-${x.tone}`}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 520, damping: 28 }}
            >
              <b>{x.v}</b>
              <span>{x.s}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.p
          key={`h-${active}`}
          className="cc-tm-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          {cur.hint}
        </motion.p>
      </motion.div>
    </div>
  )
}

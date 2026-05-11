import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronDown } from 'lucide-react'

interface Reason {
  signal: string  // e.g. "Rain in 22 min"
  inference: string // e.g. "coffee demand jumps 32%"
  source: string  // e.g. "Open-Meteo · 4:42pm"
}

interface Props {
  reasons: Reason[]
  conclusion: string // e.g. "Push pour-over with free croissant 5–7pm"
  source?: 'live' | 'mock'
}

/**
 * Shows the AI's reasoning chain explicitly — judges see the signals, the
 * inferences, the sources. Builds trust that "Catto is thinking", not magic.
 */
export function ClaudeReasoning({ reasons, conclusion, source }: Props) {
  const [open, setOpen] = useState(true)
  const isLive = source === 'live'
  return (
    <div className="cc-reasoning">
      <button
        type="button"
        className="cc-reasoning-head"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <Brain size={14} strokeWidth={2.2} aria-hidden="true" />
        <span>Catto reasoning · {reasons.length} signals → 1 play</span>
        <span className={`cc-reasoning-tag${isLive ? ' is-live' : ''}`}>
          {isLive ? 'LIVE · gpt-4.1-nano' : 'DEMO chain'}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.2}
          aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="cc-reasoning-body"
          >
            <ol className="cc-reasoning-list">
              {reasons.map((r, i) => (
                <motion.li
                  key={i}
                  initial={{ x: -6, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="cc-reasoning-signal">{r.signal}</span>
                  <span className="cc-reasoning-arrow" aria-hidden="true">→</span>
                  <span className="cc-reasoning-inference">{r.inference}</span>
                  <span className="cc-reasoning-source">{r.source}</span>
                </motion.li>
              ))}
            </ol>
            <div className="cc-reasoning-out">
              <span className="cc-reasoning-out-em" aria-hidden="true">🐱</span>
              <span>
                <b>Catto concludes:</b> {conclusion}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

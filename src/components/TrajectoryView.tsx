import { CattoPill } from './CattoPill'

interface BarRow {
  label: string
  pct: number
  isNow?: boolean
}

interface Props {
  walks: BarRow[]
  spend: BarRow[]
  retention: { total: number; on: number; caption: string }
  nextLine: React.ReactNode
}

/**
 * Pilot Trajectory — proof-of-growth story. Replaces Sandbox.
 * 3 mini bar charts (walks/wk, spend/wk, retention cohort dots) + 1
 * dark "What's next" AI prediction card. Warm pink/amber palette to
 * match the rest of the app (NOT green).
 */
export function TrajectoryView({ walks, spend, retention, nextLine }: Props) {
  return (
    <section className="cc-trajectory">
      {/* WALKS */}
      <article className="cc-traj-row">
        <header>
          <span className="cc-traj-lab">WALKS / WEEK</span>
          <span className="cc-traj-val">
            <mark>+{Math.round(((walks[walks.length - 1]?.pct ?? 0) / (walks[0]?.pct ?? 1)) * 100 - 100)}%</mark>{' '}
            vs wk 1
          </span>
        </header>
        <div className="cc-traj-bars">
          {walks.map((b, i) => (
            <div key={i} className={`cc-traj-b${b.isNow ? ' is-now' : ''}`}>
              <span className="cc-traj-bar" style={{ height: `${b.pct}%` }} />
              <span className="cc-traj-bar-l">{b.label}</span>
            </div>
          ))}
        </div>
      </article>

      {/* SPEND */}
      <article className="cc-traj-row">
        <header>
          <span className="cc-traj-lab">CUMULATIVE SHOP SPEND</span>
          <span className="cc-traj-val">
            $8.4k <mark>+$2.1k wk3</mark>
          </span>
        </header>
        <div className="cc-traj-bars cc-traj-money">
          {spend.map((b, i) => (
            <div key={i} className={`cc-traj-b${b.isNow ? ' is-now' : ''}`}>
              <span className="cc-traj-bar" style={{ height: `${b.pct}%` }} />
              <span className="cc-traj-bar-l">{b.label}</span>
            </div>
          ))}
        </div>
      </article>

      {/* RETENTION */}
      <article className="cc-traj-row">
        <header>
          <span className="cc-traj-lab">RETENTION · WK-3 WALKERS</span>
          <span className="cc-traj-val">
            <mark>{Math.round((retention.on / retention.total) * 100)}%</mark> repeat
          </span>
        </header>
        <div className="cc-traj-cohort">
          {Array.from({ length: retention.total }).map((_, i) => (
            <span key={i} className={`cc-traj-dot${i < retention.on ? ' is-on' : ''}`} />
          ))}
          <span className="cc-traj-cohort-l">{retention.caption}</span>
        </div>
      </article>

      {/* NEXT */}
      <aside className="cc-traj-next">
        <CattoPill tone="gradient">WHAT'S NEXT</CattoPill>
        <p>{nextLine}</p>
      </aside>
    </section>
  )
}

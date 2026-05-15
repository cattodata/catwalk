import type { BusinessRecord, HealthTier } from '../lib/businessHealth'
import { labelForTier, colorForTier } from '../lib/businessHealth'

export interface RadarFilters {
  types: Set<string>
  tiers: Set<HealthTier>
  streets: Set<string>
  sources: Set<'osm' | 'google' | 'abr' | 'council'>
  multilingualOnly: boolean
}

interface Props {
  records: BusinessRecord[]
  filtered: BusinessRecord[]
  filters: RadarFilters
  onChange: (next: RadarFilters) => void
}

const TIERS: HealthTier[] = ['thriving', 'stable', 'watch', 'at-risk', 'critical']
const SOURCES = ['osm', 'google', 'abr', 'council'] as const

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function RadarFilterPanel({ records, filtered, filters, onChange }: Props) {
  const typeCounts = new Map<string, number>()
  records.forEach((r) => typeCounts.set(r.type, (typeCounts.get(r.type) ?? 0) + 1))
  const tierCounts = new Map<HealthTier, number>()
  records.forEach((r) => tierCounts.set(r.tier, (tierCounts.get(r.tier) ?? 0) + 1))
  const streetCounts = new Map<string, number>()
  records.forEach((r) => {
    const s = r.street ?? 'Unknown'
    streetCounts.set(s, (streetCounts.get(s) ?? 0) + 1)
  })
  const topStreets = [...streetCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const sourceCounts = SOURCES.map((s) => [s, records.filter((r) => r.sources[s]).length] as const)

  const filteredIds = new Set(filtered.map((r) => r.id))
  const liveCount = (predicate: (r: BusinessRecord) => boolean) =>
    records.filter((r) => filteredIds.has(r.id) && predicate(r)).length

  return (
    <aside className="cc-radar-filter" aria-label="Filters">
      <div className="cc-radar-filter-section">
        <h5>Type</h5>
        {[...typeCounts.entries()].map(([t, count]) => {
          const on = filters.types.has(t)
          return (
            <label key={t} className={`cc-radar-chip${on ? ' is-on' : ''}`}>
              <input
                type="checkbox"
                checked={on}
                onChange={() => onChange({ ...filters, types: toggleSet(filters.types, t) })}
              />
              <span className="cc-radar-chip-lab">{t}</span>
              <span className="cc-radar-chip-n">{liveCount((r) => r.type === t) || count}</span>
            </label>
          )
        })}
      </div>

      <div className="cc-radar-filter-section">
        <h5>Health tier</h5>
        {TIERS.map((tier) => {
          const on = filters.tiers.has(tier)
          const count = tierCounts.get(tier) ?? 0
          return (
            <label key={tier} className={`cc-radar-chip${on ? ' is-on' : ''}`}>
              <input
                type="checkbox"
                checked={on}
                onChange={() => onChange({ ...filters, tiers: toggleSet(filters.tiers, tier) })}
              />
              <span
                className="cc-radar-chip-dot"
                style={{ background: colorForTier(tier) }}
                aria-hidden="true"
              />
              <span className="cc-radar-chip-lab">{labelForTier(tier)}</span>
              <span className="cc-radar-chip-n">{liveCount((r) => r.tier === tier) || count}</span>
            </label>
          )
        })}
      </div>

      <div className="cc-radar-filter-section">
        <h5>Street</h5>
        {topStreets.map(([street, count]) => {
          const on = filters.streets.has(street)
          return (
            <label key={street} className={`cc-radar-chip${on ? ' is-on' : ''}`}>
              <input
                type="checkbox"
                checked={on}
                onChange={() => onChange({ ...filters, streets: toggleSet(filters.streets, street) })}
              />
              <span className="cc-radar-chip-lab">{street}</span>
              <span className="cc-radar-chip-n">
                {liveCount((r) => (r.street ?? 'Unknown') === street) || count}
              </span>
            </label>
          )
        })}
      </div>

      <div className="cc-radar-filter-section">
        <h5>Data source</h5>
        {sourceCounts.map(([src, count]) => {
          const on = filters.sources.has(src)
          return (
            <label key={src} className={`cc-radar-chip${on ? ' is-on' : ''}`}>
              <input
                type="checkbox"
                checked={on}
                onChange={() => onChange({ ...filters, sources: toggleSet(filters.sources, src) })}
              />
              <span className="cc-radar-chip-lab">{src.toUpperCase()}</span>
              <span className="cc-radar-chip-n">
                {liveCount((r) => r.sources[src]) || count}
              </span>
            </label>
          )
        })}
      </div>

      <div className="cc-radar-filter-section">
        <label className={`cc-radar-chip is-toggle${filters.multilingualOnly ? ' is-on' : ''}`}>
          <input
            type="checkbox"
            checked={filters.multilingualOnly}
            onChange={() => onChange({ ...filters, multilingualOnly: !filters.multilingualOnly })}
          />
          <span className="cc-radar-chip-lab">Multilingual signage only</span>
        </label>
      </div>
    </aside>
  )
}

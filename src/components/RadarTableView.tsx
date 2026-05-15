import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import type { BusinessRecord, HealthTier } from '../lib/businessHealth'
import { colorForTier, labelForTier } from '../lib/businessHealth'

type SortKey = 'name' | 'health' | 'rating' | 'reviews' | 'street'

interface Props {
  rows: BusinessRecord[]
  selectedId: string | null
  basketIds: Set<string>
  onSelect: (r: BusinessRecord) => void
  onToggleBasket: (id: string) => void
}

export function RadarTableView({ rows, selectedId, basketIds, onSelect, onToggleBasket }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'health',
    dir: 'asc',
  })

  const sorted = [...rows].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1
    switch (sort.key) {
      case 'name':
        return a.name.localeCompare(b.name) * dir
      case 'rating':
        return ((a.signals.rating ?? 0) - (b.signals.rating ?? 0)) * dir
      case 'reviews':
        return ((a.signals.reviewCount ?? 0) - (b.signals.reviewCount ?? 0)) * dir
      case 'street':
        return (a.street ?? '').localeCompare(b.street ?? '') * dir
      case 'health':
      default:
        return (a.health - b.health) * dir
    }
  })

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  return (
    <div className="cc-radar-table">
      <div className="cc-radar-table-head" role="row">
        <span className="cc-radar-table-cb" aria-hidden="true" />
        <button type="button" onClick={() => toggleSort('name')} className="cc-radar-table-th">
          Name <ArrowUpDown size={10} />
        </button>
        <button type="button" onClick={() => toggleSort('health')} className="cc-radar-table-th">
          Health <ArrowUpDown size={10} />
        </button>
        <button type="button" onClick={() => toggleSort('rating')} className="cc-radar-table-th">
          ⭐ <ArrowUpDown size={10} />
        </button>
        <button type="button" onClick={() => toggleSort('reviews')} className="cc-radar-table-th">
          Reviews <ArrowUpDown size={10} />
        </button>
        <button type="button" onClick={() => toggleSort('street')} className="cc-radar-table-th">
          Street <ArrowUpDown size={10} />
        </button>
        <span className="cc-radar-table-th cc-radar-table-th-static">Sources</span>
      </div>
      <div className="cc-radar-table-body">
        {sorted.map((r) => {
          const inBasket = basketIds.has(r.id)
          const isSelected = selectedId === r.id
          return (
            <div
              key={r.id}
              role="row"
              className={`cc-radar-table-row${isSelected ? ' is-selected' : ''}${inBasket ? ' is-basket' : ''}`}
              onClick={() => onSelect(r)}
            >
              <label className="cc-radar-table-cb" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={inBasket}
                  onChange={() => onToggleBasket(r.id)}
                  aria-label={`Add ${r.name} to bulk contact`}
                />
              </label>
              <span className="cc-radar-table-name">{r.name}</span>
              <span
                className="cc-radar-table-health"
                style={{ background: colorForTier(r.tier) }}
                title={labelForTier(r.tier)}
              >
                {r.health}
              </span>
              <span className="cc-radar-table-rating">{r.signals.rating.toFixed(1)}</span>
              <span className="cc-radar-table-rev">{r.signals.reviewCount}</span>
              <span className="cc-radar-table-street">{r.street ?? 'Chatswood'}</span>
              <span
                className="cc-radar-table-sources"
                aria-label={`Verified by ${[
                  r.sources.osm && 'OSM',
                  r.sources.google && 'Google',
                  r.sources.abr && 'ABR',
                  r.sources.council && 'Council',
                ]
                  .filter(Boolean)
                  .join(', ') || 'no sources'}`}
              >
                {r.sources.osm && <i title="OSM" />}
                {r.sources.google && <i className="g" title="Google" />}
                {r.sources.abr && <i className="a" title="ABR" />}
                {r.sources.council && <i className="c" title="Council" />}
              </span>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="cc-radar-table-empty">No businesses match the current filters.</div>
        )}
      </div>
    </div>
  )
}

export const TIER_ORDER: HealthTier[] = ['thriving', 'stable', 'watch', 'at-risk', 'critical']

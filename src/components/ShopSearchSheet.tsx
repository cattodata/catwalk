import { useEffect, useMemo, useState } from 'react'
import { Drawer } from 'vaul'
import { Search, X, Star } from 'lucide-react'
import type { Shop } from '../types/shop'

interface Props {
  shops: Shop[]
  onSelect: (s: Shop) => void
  onClose: () => void
}

type SortBy = 'distance' | 'rating' | 'points'

/**
 * Map-FAB overlay: search shops by name + sort. Tap a result → fires
 * onSelect (parent sets selectedShop → ShopDetailSheet opens).
 */
export function ShopSearchSheet({ shops, onSelect, onClose }: Props) {
  const [open, setOpen] = useState(true)
  const [q, setQ] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('distance')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    const filtered = query ? shops.filter((s) => s.name.toLowerCase().includes(query)) : shops
    const sorted = [...filtered]
    if (sortBy === 'rating') sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    else if (sortBy === 'points') sorted.sort((a, b) => b.pts - a.pts)
    else sorted.sort((a, b) => a.dist - b.dist)
    return sorted.slice(0, 20)
  }, [shops, q, sortBy])

  return (
    <Drawer.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) onClose() }}>
      <Drawer.Portal>
        <Drawer.Overlay className="cc-vaul-overlay" />
        <Drawer.Content className="cc-vaul-content cc-search-sheet">
          <div className="cc-vaul-grab" aria-hidden="true" />
          <Drawer.Title className="cc-search-sheet-title">Search shops</Drawer.Title>
          <Drawer.Description className="cc-srs-desc">
            Find by name · sort by distance, rating, or points
          </Drawer.Description>
          <div className="cc-search-sheet-bar">
            <label className="cc-search-input">
              <Search size={14} strokeWidth={2.4} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search shops…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
                aria-label="Search shops by name"
              />
              {q && (
                <button
                  type="button"
                  className="cc-search-clear"
                  onClick={() => setQ('')}
                  aria-label="Clear search"
                >
                  <X size={12} strokeWidth={2.6} />
                </button>
              )}
            </label>
            <select
              className="cc-search-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              aria-label="Sort shops"
            >
              <option value="distance">Closest</option>
              <option value="rating">Top rated</option>
              <option value="points">Most points</option>
            </select>
          </div>
          {results.length === 0 ? (
            <p className="cc-search-sheet-empty">No shops match "{q}". Try a different name.</p>
          ) : (
            <ul className="cc-search-sheet-list">
              {results.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="cc-search-sheet-row"
                    onClick={() => {
                      setOpen(false)
                      onSelect(s)
                    }}
                  >
                    <span className="cc-search-sheet-em" aria-hidden="true">{s.emoji}</span>
                    <span className="cc-search-sheet-body">
                      <span>{s.name}</span>
                      <small>
                        {s.rating != null && (
                          <>
                            <Star size={9} strokeWidth={2.4} fill="currentColor" /> {s.rating.toFixed(1)} ·{' '}
                          </>
                        )}
                        {s.dist}m · {Math.max(1, Math.round(s.dist / 80))} min · {s.pts} pts
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

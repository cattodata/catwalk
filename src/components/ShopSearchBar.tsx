import { Search, X } from 'lucide-react'

export type SortBy = 'distance' | 'rating' | 'points'

interface Props {
  query: string
  onQueryChange: (q: string) => void
  sortBy: SortBy
  onSortChange: (s: SortBy) => void
}

export function ShopSearchBar({ query, onQueryChange, sortBy, onSortChange }: Props) {
  return (
    <div className="cc-search-bar">
      <label className="cc-search-input">
        <Search size={14} strokeWidth={2.4} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search shops…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search shops by name"
        />
        {query.length > 0 && (
          <button
            type="button"
            className="cc-search-clear"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
          >
            <X size={12} strokeWidth={2.6} />
          </button>
        )}
      </label>
      <select
        className="cc-search-sort"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortBy)}
        aria-label="Sort shops"
      >
        <option value="distance">Closest</option>
        <option value="rating">Top rated</option>
        <option value="points">Most points</option>
      </select>
    </div>
  )
}

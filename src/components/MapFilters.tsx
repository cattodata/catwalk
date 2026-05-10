import type { CuisineId, ShopTag } from '../types/shop'
import { CUISINES, TAGS } from '../data/shops'

interface MapFiltersProps {
  cuisine: CuisineId
  setCuisine: (c: CuisineId) => void
  tags: ShopTag[]
  setTags: (t: ShopTag[]) => void
  showHeatmap: boolean
  setShowHeatmap: (v: boolean) => void
}

export function MapFilters({ cuisine, setCuisine, tags, setTags, showHeatmap, setShowHeatmap }: MapFiltersProps) {
  const toggleTag = (t: ShopTag) => {
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])
  }
  return (
    <div className="cc-filters">
      <div className="cc-filters-row">
        <span className="cc-filt-label">Cuisine</span>
        {CUISINES.map((c) => (
          <button
            key={c.id}
            className={`cc-filt-chip ${cuisine === c.id ? 'is-on' : ''}`}
            onClick={() => setCuisine(c.id)}
          >
            <span style={{ marginRight: 4 }}>{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>
      <div className="cc-filters-row">
        <span className="cc-filt-label">Tags</span>
        {TAGS.map((t) => (
          <button
            key={t}
            className={`cc-filt-chip cc-filt-tag ${tags.includes(t) ? 'is-on' : ''}`}
            onClick={() => toggleTag(t)}
          >
            {tags.includes(t) ? '✓ ' : ''}
            {t}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button
          className={`cc-filt-chip cc-filt-heat ${showHeatmap ? 'is-on' : ''}`}
          onClick={() => setShowHeatmap(!showHeatmap)}
          title="Foot-traffic heatmap (predicted from TfNSW pattern)"
        >
          🔥 Heatmap
        </button>
      </div>
    </div>
  )
}

import { Star, Globe, Building2, Languages, Plus, Check, X } from 'lucide-react'
import type { BusinessRecord } from '../lib/businessHealth'
import { colorForTier, labelForTier } from '../lib/businessHealth'

interface Props {
  selected: BusinessRecord | null
  basketIds: Set<string>
  basketCount: number
  onAddToBasket: (id: string) => void
  onClear: () => void
}

export function RadarDetailPanel({ selected, basketIds, basketCount, onAddToBasket, onClear }: Props) {
  if (!selected) {
    return (
      <aside className="cc-radar-detail" aria-label="Detail panel">
        <div className="cc-radar-detail-empty">
          <h5>No business selected</h5>
          <p>Pick a pin on the map or a row in the table.</p>
          {basketCount > 0 && (
            <div className="cc-radar-detail-basket">
              <span>
                <b>{basketCount}</b> in bulk basket
              </span>
              <button type="button" onClick={onClear}>
                clear
              </button>
            </div>
          )}
        </div>
      </aside>
    )
  }

  const inBasket = basketIds.has(selected.id)
  const r = selected

  return (
    <aside className="cc-radar-detail" aria-label="Detail panel">
      <header className="cc-radar-detail-head">
        <span
          className="cc-radar-detail-tier"
          style={{ background: colorForTier(r.tier) }}
        >
          {labelForTier(r.tier)} · {r.health}
        </span>
        <h4>{r.name}</h4>
        <small>
          {r.type} · {r.cuisine} · {r.street ?? 'Chatswood'}
        </small>
      </header>

      <div className="cc-radar-detail-signals">
        <div className="cc-radar-signal">
          <span className="cc-radar-signal-ic" aria-hidden="true">
            <Star size={14} />
          </span>
          <div>
            <b>{r.signals.rating.toFixed(1)}</b>
            <small>{r.signals.reviewCount} reviews</small>
          </div>
        </div>
        <div className="cc-radar-signal">
          <span className="cc-radar-signal-ic" aria-hidden="true">
            <Globe size={14} />
          </span>
          <div>
            <b>{r.signals.websiteStatus === 'live' ? 'Live' : 'Unknown'}</b>
            <small>Website</small>
          </div>
        </div>
        <div className="cc-radar-signal">
          <span className="cc-radar-signal-ic" aria-hidden="true">
            <Languages size={14} />
          </span>
          <div>
            <b>{r.signals.multilingual ? 'Yes' : 'No'}</b>
            <small>Multilingual</small>
          </div>
        </div>
        <div className="cc-radar-signal">
          <span className="cc-radar-signal-ic" aria-hidden="true">
            <Building2 size={14} />
          </span>
          <div>
            <b>{[r.sources.osm, r.sources.google, r.sources.abr, r.sources.council].filter(Boolean).length}/4</b>
            <small>Sources</small>
          </div>
        </div>
      </div>

      <div className="cc-radar-detail-sources">
        <span className="cc-radar-detail-h">Verified by</span>
        {r.sources.osm && <span className="cc-radar-source">OSM</span>}
        {r.sources.google && <span className="cc-radar-source is-google">Google</span>}
        {r.sources.abr && <span className="cc-radar-source is-abr">ABR</span>}
        {r.sources.council && <span className="cc-radar-source is-council">Council</span>}
      </div>

      <div className="cc-radar-detail-ai">
        <span className="cc-radar-detail-h">AI summary</span>
        <p>
          {r.tier === 'thriving'
            ? `${r.name} is one of the strongest performers on ${r.street ?? 'this strip'} — high engagement and consistent visibility. Consider feature-amplify in the upcoming council campaign.`
            : r.tier === 'stable'
            ? `${r.name} holds steady. Multilingual signage ${r.signals.multilingual ? 'is in place' : 'could lift discoverability'}. Low-touch nudge recommended.`
            : r.tier === 'watch'
            ? `Watch: ${r.name}'s footprint is thinning. Review rate trending below cluster average. Suggest a check-in.`
            : r.tier === 'at-risk'
            ? `${r.name} is at-risk. Suggest immediate engagement — registration, signage subsidy, or multilingual campaign inclusion.`
            : `Critical: ${r.name} shows multiple warning signals (low reviews, source gaps). Recommend in-person council outreach this week.`}
        </p>
      </div>

      <div className="cc-radar-detail-action">
        <button
          type="button"
          className={`cc-radar-detail-add${inBasket ? ' is-in' : ''}`}
          onClick={() => onAddToBasket(r.id)}
        >
          {inBasket ? (
            <>
              <Check size={14} strokeWidth={2.4} /> In basket
            </>
          ) : (
            <>
              <Plus size={14} strokeWidth={2.4} /> Add to bulk contact
            </>
          )}
        </button>
        {basketCount > 0 && (
          <button type="button" className="cc-radar-detail-clear" onClick={onClear}>
            <X size={12} strokeWidth={2.4} />
            clear basket ({basketCount})
          </button>
        )}
      </div>
    </aside>
  )
}

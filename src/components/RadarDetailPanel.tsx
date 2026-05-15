import { Star, Globe, Building2, Languages, Plus, Check, X } from 'lucide-react'
import type { BusinessRecord } from '../lib/businessHealth'
import { colorForTier, labelForTier } from '../lib/businessHealth'

function aiSummary(r: BusinessRecord): string {
  const sourceCount = [r.sources.osm, r.sources.google, r.sources.abr, r.sources.council].filter(
    Boolean,
  ).length
  const sourceCite =
    sourceCount === 4
      ? 'all 4 sources verified'
      : sourceCount === 1
        ? 'only OSM coverage'
        : `${sourceCount}/4 sources`
  const reviewCite = r.signals.reviewCount < 80 ? `only ${r.signals.reviewCount} reviews` : `${r.signals.reviewCount} reviews`
  const ratingCite = r.signals.rating < 4.0 ? `rating ${r.signals.rating.toFixed(1)} below cluster avg 4.0` : `rating ${r.signals.rating.toFixed(1)}`
  const langCite = r.signals.multilingual
    ? 'multilingual signage detected'
    : 'no multilingual signage'
  const webCite = r.signals.websiteStatus === 'live' ? 'website live' : 'no live website found'
  const street = r.street ?? 'Chatswood'

  switch (r.tier) {
    case 'thriving':
      return `${r.name} on ${street}: health ${r.health}/100. Signals — ${ratingCite}, ${reviewCite}, ${sourceCite}, ${langCite}. Feature-amplify candidate for the next council campaign push.`
    case 'stable':
      return `${r.name} holds at ${r.health}/100 on ${street}. Signals — ${ratingCite}, ${reviewCite}, ${sourceCite}. Action: ${
        r.signals.multilingual ? 'maintain multilingual coverage' : 'add 中文/한국어 signage subsidy ($240 cap) to lift discoverability'
      }.`
    case 'watch':
      return `${r.name} drifting (health ${r.health}/100). Footprint thinning on ${street}: ${reviewCite}, ${sourceCite}, ${webCite}. Suggest week-of check-in via Catto Compass bulk contact.`
    case 'at-risk':
      return `${r.name} flagged at-risk (health ${r.health}/100) on ${street}. Drivers — ${ratingCite}, ${reviewCite}, ${webCite}. Recommend immediate outreach: business-name registration + signage subsidy + multilingual inclusion.`
    case 'critical':
    default:
      return `Critical: ${r.name} on ${street} scoring ${r.health}/100. Compound risk — ${ratingCite}, ${reviewCite}, ${sourceCite}, ${webCite}. Council should schedule in-person visit this week and offer the shop-front grants packet (Lunar NY round closes Fri).`
  }
}

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
          <h4>No business selected</h4>
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
        <p>{aiSummary(r)}</p>
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

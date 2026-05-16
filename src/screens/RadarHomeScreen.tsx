import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Map as MapIcon, Table as TableIcon, Filter, ChevronUp, Mail, Sparkles } from 'lucide-react'

import { useRealShops } from '../hooks/useRealShops'
import { useGooglePlaces } from '../hooks/useGooglePlaces'
import { enrichShop, type BusinessRecord, colorForTier } from '../lib/businessHealth'

import { RadarKpiStrip } from '../components/RadarKpiStrip'
import { RadarFilterPanel, type RadarFilters } from '../components/RadarFilterPanel'
import { RadarTableView } from '../components/RadarTableView'
import { RadarDetailPanel } from '../components/RadarDetailPanel'
import { RadarActionBar } from '../components/RadarActionBar'
import { BulkContactSheet } from '../components/BulkContactSheet'
import { RealMap } from '../components/RealMap'

function downloadCsv(records: BusinessRecord[]) {
  const header = ['name', 'type', 'cuisine', 'street', 'health', 'tier', 'rating', 'reviews', 'sources']
  const rows = records.map((r) => [
    r.name,
    r.type,
    r.cuisine,
    r.street ?? '',
    r.health,
    r.tier,
    r.signals.rating.toFixed(1),
    r.signals.reviewCount,
    [r.sources.osm && 'OSM', r.sources.google && 'Google', r.sources.abr && 'ABR', r.sources.council && 'Council']
      .filter(Boolean)
      .join('+'),
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `catto-radar-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function RadarHomeScreen() {
  const navigate = useNavigate()
  const { shops: rawShops } = useRealShops()
  const shops = useGooglePlaces(rawShops)

  const records = useMemo<BusinessRecord[]>(() => shops.map(enrichShop), [shops])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [basketIds, setBasketIds] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'map' | 'table'>('map')
  const [filters, setFilters] = useState<RadarFilters>({
    types: new Set(),
    tiers: new Set(),
    streets: new Set(),
    sources: new Set(),
    multilingualOnly: false,
  })
  const [bulkOpen, setBulkOpen] = useState(false)
  const [mobileSheet, setMobileSheet] = useState<'filter' | 'detail' | null>(null)
  const [aiBrief, setAiBrief] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  // v6 — Mobile (<900px) renders a simpler list-first layout. Desktop keeps the
  // 3-pane "power view". Watch for resize so a rotated tablet/devtools switch
  // re-routes the layout without a refresh.
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)')
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filters.types.size && !filters.types.has(r.type)) return false
      if (filters.tiers.size && !filters.tiers.has(r.tier)) return false
      if (filters.streets.size && !filters.streets.has(r.street ?? 'Unknown')) return false
      if (filters.sources.size) {
        let any = false
        filters.sources.forEach((s) => {
          if (r.sources[s]) any = true
        })
        if (!any) return false
      }
      if (filters.multilingualOnly && !r.signals.multilingual) return false
      return true
    })
  }, [records, filters])

  const selected = useMemo(
    () => filtered.find((r) => r.id === selectedId) ?? records.find((r) => r.id === selectedId) ?? null,
    [filtered, records, selectedId],
  )
  const recipients = useMemo(() => records.filter((r) => basketIds.has(r.id)), [records, basketIds])

  // Critical & at-risk top 10 (worst health first) for the mobile list-first view.
  const criticalList = useMemo(
    () =>
      [...filtered]
        .filter((r) => r.tier === 'critical' || r.tier === 'at-risk' || r.tier === 'watch')
        .sort((a, b) => a.health - b.health)
        .slice(0, 10),
    [filtered],
  )

  const toggleBasket = (id: string) => {
    setBasketIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const onSelect = (r: BusinessRecord) => {
    setSelectedId(r.id)
    if (window.innerWidth < 900) setMobileSheet('detail')
  }

  const onAiBrief = async () => {
    setAiLoading(true)
    setAiBrief(null)
    try {
      const sample = filtered.slice(0, 20).map((r) => ({
        name: r.name,
        type: r.type,
        street: r.street,
        health: r.health,
        tier: r.tier,
      }))
      const res = await fetch('/api/claude-text', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          system:
            'You are a Willoughby City Council analyst. Write a concise 4-sentence weekly business-radar brief. Focus on at-risk and critical clusters by street, and one upside thriving signal. Plain English, no markdown.',
          user: `Sample of ${filtered.length} businesses in scope: ${JSON.stringify(sample)}`,
        }),
      })
      if (!res.ok) throw new Error(`brief-${res.status}`)
      const data = await res.json()
      if (typeof data.text === 'string' && data.text.trim()) {
        setAiBrief(data.text)
      } else {
        throw new Error('brief-empty')
      }
    } catch {
      const critical = filtered.filter((r) => r.tier === 'critical').length
      const atRisk = filtered.filter((r) => r.tier === 'at-risk').length
      const thriving = filtered.filter((r) => r.tier === 'thriving').length
      const reachable = critical + atRisk
      const topStreet =
        [...new Set(filtered.filter((r) => r.tier !== 'thriving').map((r) => r.street ?? 'Chatswood'))]
          .filter((s) => s !== 'Unknown')
          .slice(0, 1)[0] ?? 'Chatswood'
      const cohortLine =
        reachable === 0
          ? `No at-risk or critical merchants in current filter set — system is healthy.`
          : reachable === 1
            ? `1 merchant needs outreach this week (${critical} critical, ${atRisk} at-risk). Single-touch follow-up via the bulk contact sheet.`
            : `${reachable} merchants need outreach this week (${critical} critical + ${atRisk} at-risk). Recommend bulk multilingual contact via Resend.`
      setAiBrief(
        `${filtered.length} businesses in scope · avg health ${Math.round(filtered.reduce((s, r) => s + r.health, 0) / Math.max(1, filtered.length))}/100. ${cohortLine} ${thriving} thriving merchants — pair top performers with at-risk neighbours on ${topStreet} for cross-traffic boost.`,
      )
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="cc-radar">
      <header className="cc-radar-bar">
        <button type="button" className="cc-radar-back" onClick={() => navigate('/council')}>
          <ArrowLeft size={16} strokeWidth={2.4} />
          Council
        </button>
        <div className="cc-radar-title">
          <span className="cc-radar-title-tile" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22">
              <defs>
                <linearGradient id="cc-radar-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF6B9D" />
                  <stop offset="100%" stopColor="#F5C842" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#cc-radar-grad)" />
              <circle cx="16" cy="16" r="9" fill="none" stroke="#fff" strokeWidth="1.8" />
              <circle cx="16" cy="16" r="3" fill="#fff" />
              <line x1="16" y1="16" x2="23" y2="9" stroke="#fff" strokeWidth="1.8" />
            </svg>
          </span>
          <span className="cc-radar-title-text">
            <span className="cc-radar-title-h">Catto Radar</span>
            <span className="cc-radar-title-sub">Council business intelligence · Chatswood pilot</span>
          </span>
        </div>
      </header>

      <RadarKpiStrip records={records} filteredCount={filtered.length} />

      {/* v6 Calm Complete · Mobile list-first view (KPI + AI brief + critical
          list + bulk CTA). Desktop ≥900px gets the full 3-pane power view below. */}
      {isMobile && (
        <div className="cc-radar-mobile">
          {aiLoading ? (
            <div className="cc-radar-brief is-loading">Catto is reading the radar…</div>
          ) : (
            <div className="cc-radar-brief">
              <header>
                <b>AI weekly brief</b>
                {!aiBrief && (
                  <button type="button" onClick={onAiBrief}>
                    <Sparkles size={11} strokeWidth={2.2} /> generate
                  </button>
                )}
              </header>
              <p>
                {aiBrief ?? (
                  <>
                    {filtered.length} businesses in scope · avg health{' '}
                    {Math.round(
                      filtered.reduce((s, r) => s + r.health, 0) / Math.max(1, filtered.length),
                    )}
                    /100 · {criticalList.length} need outreach this week. Tap "generate" for
                    the full AI brief.
                  </>
                )}
              </p>
            </div>
          )}

          <section className="cc-radar-mobile-list">
            <header>
              <h5>Critical & at-risk · this week</h5>
              <small>{criticalList.length} of {filtered.length} businesses</small>
            </header>
            <ul>
              {criticalList.map((r) => {
                const inBasket = basketIds.has(r.id)
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      className={`cc-radar-mobile-row${inBasket ? ' is-basket' : ''}`}
                      onClick={() => onSelect(r)}
                    >
                      <span
                        className="cc-radar-mobile-swatch"
                        style={{ background: colorForTier(r.tier) }}
                        aria-hidden="true"
                      />
                      <span className="cc-radar-mobile-name">
                        <b>{r.name}</b>
                        <small>
                          {(r.street ?? 'Chatswood').toUpperCase()} · {r.type}
                        </small>
                      </span>
                      <span
                        className="cc-radar-mobile-score"
                        style={{ color: colorForTier(r.tier) }}
                      >
                        {r.health}
                      </span>
                      <button
                        type="button"
                        className={`cc-radar-mobile-basket${inBasket ? ' is-on' : ''}`}
                        aria-label={inBasket ? 'Remove from bulk' : 'Add to bulk'}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBasket(r.id)
                        }}
                      >
                        {inBasket ? '✓' : '+'}
                      </button>
                    </button>
                  </li>
                )
              })}
              {criticalList.length === 0 && (
                <li className="cc-radar-mobile-empty">
                  No at-risk or critical merchants in the current filter set — system is healthy.
                </li>
              )}
            </ul>
          </section>

          <button
            type="button"
            className="cc-radar-mobile-bulk-cta"
            onClick={() => setBulkOpen(true)}
            disabled={basketIds.size === 0 && criticalList.length === 0}
          >
            <Mail size={15} strokeWidth={2.2} />
            <span>
              Bulk multilingual outreach
              {basketIds.size > 0 ? ` (${basketIds.size} selected)` : ''}
            </span>
          </button>

          <button
            type="button"
            className="cc-radar-mobile-power"
            onClick={() => setMobileSheet(mobileSheet === 'filter' ? null : 'filter')}
          >
            <Filter size={13} /> Power view · filter · map · table ›
          </button>
        </div>
      )}

      {!isMobile && (
      <>
      <div className="cc-radar-canvas-bar">
        <div className="cc-radar-view-toggle" role="tablist" aria-label="Canvas view">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'map'}
            className={`cc-radar-view-tab${view === 'map' ? ' is-on' : ''}`}
            onClick={() => setView('map')}
          >
            <MapIcon size={13} /> Map
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'table'}
            className={`cc-radar-view-tab${view === 'table' ? ' is-on' : ''}`}
            onClick={() => setView('table')}
          >
            <TableIcon size={13} /> Table
          </button>
        </div>
        <button
          type="button"
          className="cc-radar-mobile-filter"
          onClick={() => setMobileSheet(mobileSheet === 'filter' ? null : 'filter')}
        >
          <Filter size={13} /> Filters{' '}
          <span className="cc-radar-mobile-filter-n">
            {filters.types.size + filters.tiers.size + filters.streets.size + filters.sources.size + (filters.multilingualOnly ? 1 : 0)}
          </span>
        </button>
      </div>

      {aiBrief && (
        <div className="cc-radar-brief">
          <header>
            <b>AI weekly brief</b>
            <button type="button" onClick={() => setAiBrief(null)}>
              dismiss
            </button>
          </header>
          <p>{aiBrief}</p>
        </div>
      )}
      {aiLoading && <div className="cc-radar-brief is-loading">Catto is reading the radar…</div>}

      <div className="cc-radar-grid">
        <div className={`cc-radar-pane is-filter${mobileSheet === 'filter' ? ' is-open' : ''}`}>
          <RadarFilterPanel
            records={records}
            filtered={filtered}
            filters={filters}
            onChange={setFilters}
          />
        </div>

        <div className="cc-radar-pane is-canvas">
          {view === 'map' ? (
            <div className="cc-radar-mapwrap">
              <RealMap
                shops={filtered}
                selectedShop={selected}
                walkProgress={null}
                walking={false}
                completed={false}
                onSelect={(s) => {
                  const found = records.find((r) => r.id === s.id)
                  if (found) onSelect(found)
                }}
                userPosition={null}
                recenterNonce={0}
              />
              <ul className="cc-radar-legend">
                {(['thriving', 'stable', 'watch', 'at-risk', 'critical'] as const).map((t) => (
                  <li key={t}>
                    <i style={{ background: colorForTier(t) }} aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <RadarTableView
              rows={filtered}
              selectedId={selectedId}
              basketIds={basketIds}
              onSelect={onSelect}
              onToggleBasket={toggleBasket}
            />
          )}
        </div>

        <div className={`cc-radar-pane is-detail${mobileSheet === 'detail' ? ' is-open' : ''}`}>
          <RadarDetailPanel
            selected={selected}
            basketIds={basketIds}
            basketCount={basketIds.size}
            onAddToBasket={toggleBasket}
            onClear={() => setBasketIds(new Set())}
          />
          {mobileSheet === 'detail' && (
            <button
              type="button"
              className="cc-radar-mobile-close"
              onClick={() => setMobileSheet(null)}
            >
              <ChevronUp size={14} /> back to canvas
            </button>
          )}
        </div>
      </div>
      </>
      )}

      <RadarActionBar
        total={filtered.length}
        basketCount={basketIds.size}
        onExport={() => downloadCsv(basketIds.size > 0 ? recipients : filtered)}
        onBulkEmail={() => setBulkOpen(true)}
        onAiBrief={onAiBrief}
      />

      <BulkContactSheet
        recipients={recipients.length > 0 ? recipients : filtered.slice(0, 10)}
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
      />
    </div>
  )
}

import { useMemo } from 'react'
import type { Shop, BizType } from '../types/shop'

interface CompetitorRadarProps {
  shop: Shop | null
  bizType: BizType
  allShops: Shop[]
}

/**
 * "Competitor Radar" — for shop owners.
 * Shows: position vs same-category competitors nearby, distance distribution,
 * and how this shop ranks for foot traffic potential.
 *
 * Uses real Overpass shop data (no mock).
 */
export function CompetitorRadar({ shop, bizType, allShops }: CompetitorRadarProps) {
  const analysis = useMemo(() => {
    const sameType = allShops.filter((s) => s.type === bizType)
    if (sameType.length === 0) return null

    // Sort by distance from station (proxy for foot-traffic potential)
    const sorted = [...sameType].sort((a, b) => a.dist - b.dist)
    const targetIdx = shop ? sorted.findIndex((s) => s.id === shop.id) : -1
    const rank = targetIdx + 1
    const total = sorted.length

    // Avg distance from station
    const avgDist = Math.round(sorted.reduce((acc, s) => acc + s.dist, 0) / total)

    // Top 5 competitors near our shop (by distance from us)
    const competitors = shop
      ? [...sameType]
          .filter((s) => s.id !== shop.id)
          .map((s) => ({
            ...s,
            distFromUs:
              shop.lat && shop.lng && s.lat && s.lng
                ? Math.round(
                    Math.hypot((s.lat - shop.lat) * 111_000, (s.lng - shop.lng) * 88_000),
                  )
                : Math.abs(s.dist - shop.dist),
          }))
          .sort((a, b) => a.distFromUs - b.distFromUs)
          .slice(0, 5)
      : []

    return { sorted, rank, total, avgDist, competitors }
  }, [shop, bizType, allShops])

  if (!analysis) {
    return null
  }

  const { rank, total, avgDist, competitors } = analysis

  return (
    <div className="cc-card cc-radar-card">
      <div className="ins-head">
        <h2>📡 Competitor radar</h2>
        <span className="cc-eyebrow" style={{ fontSize: 10, opacity: 0.7 }}>
          OSM · live
        </span>
      </div>
      {shop && rank > 0 ? (
        <div className="cc-radar-rank">
          <div>
            <div className="cc-radar-rank-num">
              <b>#{rank}</b>
              <small>of {total} {bizType.toLowerCase()}s</small>
            </div>
            <div className="cc-radar-rank-sub">
              by distance from station · neighborhood avg <b>{avgDist}m</b>
            </div>
          </div>
          <div className="cc-radar-bar">
            <div
              className="cc-radar-bar-fill"
              style={{ width: `${Math.min(100, ((total - rank + 1) / total) * 100)}%` }}
              title={`Position ${rank} of ${total} · top ${Math.round((rank / total) * 100)}%`}
            />
          </div>
        </div>
      ) : (
        <div className="cc-radar-empty">
          {total} {bizType.toLowerCase()}s nearby · avg {avgDist}m from station. Pick a pin to see your rank.
        </div>
      )}

      {competitors.length > 0 && (
        <>
          <div className="cc-eyebrow" style={{ marginTop: 14, marginBottom: 6, fontSize: 10 }}>
            Nearest 5 competitors
          </div>
          <ul className="cc-radar-comp-list">
            {competitors.map((c) => (
              <li key={c.id}>
                <span className="cc-radar-comp-emoji">{c.emoji}</span>
                <span className="cc-radar-comp-name">{c.name}</span>
                <span className="cc-radar-comp-dist">
                  {c.distFromUs < 1000 ? `${c.distFromUs}m` : `${(c.distFromUs / 1000).toFixed(1)}km`}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

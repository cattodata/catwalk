import type { BusinessRecord } from '../lib/businessHealth'
import { aggregateKpis } from '../lib/businessHealth'

interface Props {
  records: BusinessRecord[]
  filteredCount: number
  lastSync?: string
}

export function RadarKpiStrip({ records, filteredCount, lastSync = 'just now' }: Props) {
  const k = aggregateKpis(records)
  const tiles = [
    { lab: 'Total', val: k.total, sub: filteredCount !== k.total ? `${filteredCount} filtered` : 'in scope' },
    { lab: 'Avg health', val: k.avgHealth, sub: 'score 0–100' },
    { lab: 'Thriving', val: k.thriving, sub: 'top tier' },
    { lab: 'Critical', val: k.critical, sub: 'urgent', tone: 'danger' as const },
    { lab: 'Multilingual', val: k.multilingual, sub: '中文 · 한국어' },
    { lab: 'Google %', val: `${k.googlePct}%`, sub: lastSync },
  ]
  return (
    <div className="cc-radar-kpi" role="group" aria-label="Council radar KPIs">
      {tiles.map((t) => (
        <div key={t.lab} className={`cc-radar-kpi-tile${t.tone ? ` is-${t.tone}` : ''}`}>
          <span className="cc-radar-kpi-lab">{t.lab}</span>
          <b className="cc-radar-kpi-val">{t.val}</b>
          <span className="cc-radar-kpi-sub">{t.sub}</span>
        </div>
      ))}
    </div>
  )
}

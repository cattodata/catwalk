import { Download, Mail, Sparkles } from 'lucide-react'

interface Props {
  total: number
  basketCount: number
  onExport: () => void
  onBulkEmail: () => void
  onAiBrief: () => void
}

export function RadarActionBar({ total, basketCount, onExport, onBulkEmail, onAiBrief }: Props) {
  return (
    <div className="cc-radar-action" role="toolbar" aria-label="Bulk actions">
      <span className="cc-radar-action-sel">
        <b>{basketCount}</b> selected · {total} in view
      </span>
      <div className="cc-radar-action-cta">
        <button type="button" className="cc-radar-btn" onClick={onExport}>
          <Download size={14} strokeWidth={2.2} />
          <span>Export CSV</span>
        </button>
        <button
          type="button"
          className="cc-radar-btn is-primary"
          onClick={onBulkEmail}
          disabled={basketCount === 0}
          title={basketCount === 0 ? 'Pick at least one business to contact' : ''}
        >
          <Mail size={14} strokeWidth={2.2} />
          <span>Bulk email · Resend</span>
        </button>
        <button type="button" className="cc-radar-btn is-ghost" onClick={onAiBrief}>
          <Sparkles size={14} strokeWidth={2.2} />
          <span>AI weekly brief</span>
        </button>
      </div>
    </div>
  )
}

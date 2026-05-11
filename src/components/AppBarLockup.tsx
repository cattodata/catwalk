import { Bell } from 'lucide-react'
import { SwitchRoleGear } from './SwitchRoleSheet'

interface Props {
  title?: string
  sub?: string
  hasUnread?: boolean
  showGear?: boolean
}

/**
 * Walker/Owner/Council home app bar — gradient pill logo + brand text + bell + settings gear.
 */
export function AppBarLockup({
  title = 'Catto Compass',
  sub = 'CHATSWOOD',
  hasUnread = false,
  showGear = true,
}: Props) {
  return (
    <header className="cc-appbar">
      <div className="cc-appbar-logo">
        <span className="cc-appbar-logo-tile" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="22" height="22">
            <rect width="32" height="32" rx="8" fill="#2D2418" />
            <rect x="9" y="11" width="3" height="3" fill="#F5C842" />
            <rect x="20" y="11" width="3" height="3" fill="#F5C842" />
            <rect x="13" y="19" width="6" height="2" fill="#FF6B9D" />
          </svg>
        </span>
        <span className="cc-appbar-text">
          <span className="cc-appbar-title">{title}</span>
          <span className="cc-appbar-sub">{sub}</span>
        </span>
      </div>
      <div className="cc-appbar-actions">
        <button type="button" className="cc-icon-btn" aria-label="Notifications">
          <Bell size={18} strokeWidth={2} aria-hidden="true" />
          {hasUnread && <span className="cc-icon-btn-dot" aria-hidden="true" />}
        </button>
        {showGear && <SwitchRoleGear />}
      </div>
    </header>
  )
}

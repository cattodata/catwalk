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
  title = 'CatWalk',
  sub = 'CHATSWOOD',
  hasUnread = false,
  showGear = true,
}: Props) {
  return (
    <header className="cc-appbar">
      <div className="cc-appbar-logo">
        <span className="cc-appbar-logo-tile" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="22" height="22">
            {/* Tiny ears */}
            <path d="M7 8 L10 8 L8.5 5 Z" fill="#fff" opacity="0.92" />
            <path d="M22 8 L25 8 L23.5 5 Z" fill="#fff" opacity="0.92" />
            {/* Catto pixel face — white on gradient bg from outer tile */}
            <rect x="9" y="11" width="3" height="3" fill="#fff" />
            <rect x="20" y="11" width="3" height="3" fill="#fff" />
            <rect x="13" y="19" width="6" height="2" fill="#fff" rx="1" />
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

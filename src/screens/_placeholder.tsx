import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SwitchRoleGear } from '../components/SwitchRoleSheet'

/**
 * Temporary placeholder used by F5 routing skeleton. Each real screen
 * (S1-S7) will replace its placeholder once built.
 */
export function ScreenPlaceholder({
  title,
  routePath,
  showGear = true,
  showBackTo,
  children,
}: {
  title: string
  routePath: string
  showGear?: boolean
  showBackTo?: { path: string; label: string }
  children?: ReactNode
}) {
  return (
    <div className="cc-placeholder">
      <header className="cc-placeholder-bar">
        {showBackTo ? (
          <Link to={showBackTo.path} className="cc-icon-btn">
            ← {showBackTo.label}
          </Link>
        ) : (
          <span />
        )}
        {showGear && <SwitchRoleGear />}
      </header>
      <main className="cc-placeholder-body">
        <h1>{title}</h1>
        <code>{routePath}</code>
        {children}
      </main>
    </div>
  )
}

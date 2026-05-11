import { NavLink } from 'react-router-dom'
import { Footprints, Store, BarChart3 } from 'lucide-react'

const ITEMS = [
  { to: '/walk', label: 'Walk', Icon: Footprints },
  { to: '/owner', label: 'Owners', Icon: Store },
  { to: '/council', label: 'Pilot', Icon: BarChart3 },
] as const

export function BottomNav() {
  return (
    <nav className="cc-botnav" aria-label="Personas">
      {ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `cc-botnav-it${isActive ? ' is-act' : ''}`}
        >
          <Icon size={18} strokeWidth={2} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

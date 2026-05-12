import { NavLink } from 'react-router-dom'
import { Map, Footprints, Award, User } from 'lucide-react'

const ITEMS = [
  { to: '/walk', label: 'Discover', Icon: Map, end: true },
  { to: '/walk/plan', label: 'Plan', Icon: Footprints, end: false },
  { to: '/walk/rewards', label: 'Rewards', Icon: Award, end: false },
  { to: '/walk/profile', label: 'Profile', Icon: User, end: false },
] as const

export function BottomNav() {
  return (
    <nav className="cc-botnav" aria-label="Walker modes">
      {ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `cc-botnav-it${isActive ? ' is-act' : ''}`}
        >
          <Icon size={18} strokeWidth={2} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

import { useNavigate } from 'react-router-dom'
import { Footprints, Store, BarChart3, ArrowRight } from 'lucide-react'
import { useUserRole, roleHomePath, type UserRole } from '../context/UserRoleContext'
import { CityPickerChip } from '../components/CityPickerChip'

interface RoleDef {
  id: UserRole
  variant: 'primary' | 'r2' | 'r3'
  label: string
  sub: string
  Icon: typeof Footprints
}

const ROLES: RoleDef[] = [
  { id: 'walker', variant: 'primary', label: "I'm a walker", sub: 'Earn points + discounts', Icon: Footprints },
  { id: 'owner', variant: 'r2', label: 'I own a shop', sub: "Plan today's marketing", Icon: Store },
  { id: 'council', variant: 'r3', label: "I'm with Council", sub: 'Pilot stats + policy', Icon: BarChart3 },
]

export function OnboardingScreen() {
  const { setRole } = useUserRole()
  const navigate = useNavigate()

  const pickRole = (r: UserRole) => {
    setRole(r)
    navigate(roleHomePath(r))
  }

  return (
    <div className="cc-onb">
      <div className="cc-onb-citybar">
        <CityPickerChip />
      </div>
      <div className="cc-onb-top">
        <div className="cc-onb-mascot" aria-hidden="true">
          <span>🐱</span>
        </div>
        <h1 className="cc-onb-h1">
          Walk Chatswood.
          <br />
          <em>Earn rewards.</em>
        </h1>
        <p className="cc-onb-tag">
          Pick a shop. Walk there. Earn points + a discount + log CO₂ saved.
        </p>
      </div>

      <div className="cc-onb-stack">
        {ROLES.map(({ id, variant, label, sub, Icon }) => (
          <button
            key={id}
            type="button"
            className={`cc-role cc-role-${variant}`}
            onClick={() => pickRole(id)}
          >
            <span className="cc-role-em" aria-hidden="true">
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className="cc-role-t">
              <b>{label}</b>
              <small>{sub}</small>
            </span>
            <ArrowRight size={16} aria-hidden="true" className="cc-role-arr" />
          </button>
        ))}
      </div>
    </div>
  )
}

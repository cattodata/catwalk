import { Link } from 'react-router-dom'
import { useUserRole, roleHomePath, type UserRole } from '../context/UserRoleContext'

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'walker', label: 'Walker' },
  { id: 'owner', label: 'Owner' },
  { id: 'council', label: 'Council' },
]

export function OnboardingScreen() {
  const { setRole } = useUserRole()
  return (
    <div className="cc-placeholder">
      <main className="cc-placeholder-body">
        <h1>Onboarding</h1>
        <code>/onboarding</code>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {ROLES.map((r) => (
            <Link
              key={r.id}
              to={roleHomePath(r.id)}
              onClick={() => setRole(r.id)}
              className="cc-placeholder-link"
            >
              I'm a {r.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

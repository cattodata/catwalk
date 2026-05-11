import { Link } from 'react-router-dom'
import { ScreenPlaceholder } from './_placeholder'

export function WalkerHomeScreen() {
  return (
    <ScreenPlaceholder title="Walker Home" routePath="/walk">
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        <Link to="/walk/park" className="cc-placeholder-link">/walk/park · Park-and-Walk</Link>
        <Link to="/walk/live" className="cc-placeholder-link">/walk/live · Walking Live</Link>
        <Link to="/walk/reward" className="cc-placeholder-link">/walk/reward · Reward</Link>
      </nav>
    </ScreenPlaceholder>
  )
}

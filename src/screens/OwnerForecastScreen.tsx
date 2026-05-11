import { Link } from 'react-router-dom'
import { ScreenPlaceholder } from './_placeholder'

export function OwnerForecastScreen() {
  return (
    <ScreenPlaceholder title="Owner · Forecast + A/B" routePath="/owner">
      <Link to="/owner/campaign" className="cc-placeholder-link" style={{ marginTop: 16 }}>
        /owner/campaign · Run AI campaign with photo →
      </Link>
    </ScreenPlaceholder>
  )
}

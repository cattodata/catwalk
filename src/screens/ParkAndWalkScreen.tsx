import { ScreenPlaceholder } from './_placeholder'

export function ParkAndWalkScreen() {
  return (
    <ScreenPlaceholder
      title="Park-and-Walk"
      routePath="/walk/park"
      showBackTo={{ path: '/walk', label: 'Walk' }}
      showGear={false}
    />
  )
}

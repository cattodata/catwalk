import { ScreenPlaceholder } from './_placeholder'

export function WalkingLiveScreen() {
  return (
    <ScreenPlaceholder
      title="Walking Live"
      routePath="/walk/live"
      showBackTo={{ path: '/walk', label: 'Walk' }}
      showGear={false}
    />
  )
}

import { ScreenPlaceholder } from './_placeholder'

export function RewardScreen() {
  return (
    <ScreenPlaceholder
      title="Reward · Payoff"
      routePath="/walk/reward"
      showBackTo={{ path: '/walk', label: 'Done' }}
      showGear={false}
    />
  )
}

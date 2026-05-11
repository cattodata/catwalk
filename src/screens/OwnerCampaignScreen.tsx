import { ScreenPlaceholder } from './_placeholder'

export function OwnerCampaignScreen() {
  return (
    <ScreenPlaceholder
      title="Owner · Campaign wizard"
      routePath="/owner/campaign"
      showBackTo={{ path: '/owner', label: 'Daily' }}
      showGear={false}
    />
  )
}

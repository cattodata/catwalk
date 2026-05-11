import { Navigate, Route, Routes } from 'react-router-dom'
import { useUserRole, UserRoleProvider, roleHomePath } from './context/UserRoleContext'
import { MobileShell } from './components/MobileShell'

import { OnboardingScreen } from './screens/OnboardingScreen'
import { WalkerHomeScreen } from './screens/WalkerHomeScreen'
import { ParkAndWalkScreen } from './screens/ParkAndWalkScreen'
import { WalkingLiveScreen } from './screens/WalkingLiveScreen'
import { RewardScreen } from './screens/RewardScreen'
import { OwnerForecastScreen } from './screens/OwnerForecastScreen'
import { OwnerCampaignScreen } from './screens/OwnerCampaignScreen'
import { CouncilSandboxScreen } from './screens/CouncilSandboxScreen'

export function App() {
  return (
    <UserRoleProvider>
      <MobileShell>
        <AppRoutes />
      </MobileShell>
    </UserRoleProvider>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/walk" element={<WalkerHomeScreen />} />
      <Route path="/walk/park" element={<ParkAndWalkScreen />} />
      <Route path="/walk/live" element={<WalkingLiveScreen />} />
      <Route path="/walk/reward" element={<RewardScreen />} />
      <Route path="/owner" element={<OwnerForecastScreen />} />
      <Route path="/owner/campaign" element={<OwnerCampaignScreen />} />
      <Route path="/council" element={<CouncilSandboxScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RootRedirect() {
  const { role } = useUserRole()
  return <Navigate to={role ? roleHomePath(role) : '/onboarding'} replace />
}

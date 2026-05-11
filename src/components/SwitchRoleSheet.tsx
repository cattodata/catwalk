import { Drawer } from 'vaul'
import { useNavigate } from 'react-router-dom'
import { Settings, ArrowRight } from 'lucide-react'
import { useUserRole } from '../context/UserRoleContext'

export function SwitchRoleGear() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="cc-icon-btn"
          aria-label="Settings"
        >
          <Settings size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="cc-vaul-overlay" />
        <Drawer.Content className="cc-vaul-content">
          <div className="cc-vaul-grab" aria-hidden="true" />
          <SwitchRoleSheetContent />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function SwitchRoleSheetContent() {
  const { switchRole } = useUserRole()
  const navigate = useNavigate()

  const handleSwitch = () => {
    switchRole()
    navigate('/onboarding')
  }

  return (
    <div className="cc-srs">
      <Drawer.Title className="cc-srs-title">Settings</Drawer.Title>
      <Drawer.Description className="cc-srs-desc">
        Demo this app from a different perspective
      </Drawer.Description>
      <button type="button" className="cc-srs-action" onClick={handleSwitch}>
        <span className="cc-srs-action-body">
          <b>Switch role</b>
          <small>Go back to the role picker</small>
        </span>
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

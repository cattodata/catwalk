import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type UserRole = 'walker' | 'owner' | 'council'

const STORAGE_KEY = 'cc:userRole'

function readRole(): UserRole | null {
  if (typeof window === 'undefined') return null
  const v = window.localStorage.getItem(STORAGE_KEY)
  return v === 'walker' || v === 'owner' || v === 'council' ? v : null
}

interface Ctx {
  role: UserRole | null
  setRole: (r: UserRole) => void
  switchRole: () => void
}

const UserRoleContext = createContext<Ctx | null>(null)

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(() => readRole())

  useEffect(() => {
    if (role) window.localStorage.setItem(STORAGE_KEY, role)
  }, [role])

  const setRole = useCallback((r: UserRole) => setRoleState(r), [])

  const switchRole = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setRoleState(null)
  }, [])

  return (
    <UserRoleContext.Provider value={{ role, setRole, switchRole }}>{children}</UserRoleContext.Provider>
  )
}

export function useUserRole() {
  const ctx = useContext(UserRoleContext)
  if (!ctx) throw new Error('useUserRole must be used within UserRoleProvider')
  return ctx
}

export function roleHomePath(r: UserRole): string {
  return r === 'walker' ? '/walk' : r === 'owner' ? '/owner' : '/council'
}

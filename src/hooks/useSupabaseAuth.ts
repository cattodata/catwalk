import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAnonymous: boolean
  hasSupabase: boolean
}

/**
 * Auto-creates an anonymous Supabase session on first load.
 * V2 can upgrade to email/social auth without losing data (auth.linkIdentity).
 */
export function useSupabaseAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAnonymous: false,
    hasSupabase: supabase !== null,
  })

  useEffect(() => {
    const sb = supabase
    if (!sb) {
      setState((s) => ({ ...s, isLoading: false }))
      return
    }

    const init = async () => {
      const { data } = await sb.auth.getSession()
      if (data.session) {
        setState({
          user: data.session.user,
          session: data.session,
          isLoading: false,
          isAnonymous: data.session.user.is_anonymous ?? false,
          hasSupabase: true,
        })
        return
      }
      // No session — sign in anonymously
      const { data: signInData, error } = await sb.auth.signInAnonymously()
      if (error) {
        // Anonymous auth might be disabled in this Supabase project — log and continue
        console.warn('Anonymous auth failed:', error.message)
        setState((s) => ({ ...s, isLoading: false }))
        return
      }
      setState({
        user: signInData.user,
        session: signInData.session,
        isLoading: false,
        isAnonymous: true,
        hasSupabase: true,
      })
    }
    init()

    const { data: sub } = sb.auth.onAuthStateChange((_evt, session) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAnonymous: session?.user.is_anonymous ?? false,
        hasSupabase: true,
      })
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return state
}

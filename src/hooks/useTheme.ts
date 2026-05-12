import { useEffect } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'cc-theme'

/**
 * Theme hook — locked to light mode. Dark mode is disabled by product
 * decision (warm-paper palette only). Keeps the same API surface for
 * any consumer expecting `theme` / `toggle` but `toggle` is a no-op.
 */
export function useTheme() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    // Clear any stale dark preference left over from older sessions
    try {
      const saved = window.localStorage.getItem(KEY)
      if (saved === 'dark') window.localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const theme: Theme = 'light'
  const setTheme = () => undefined
  const toggle = () => undefined

  return { theme, setTheme, toggle }
}

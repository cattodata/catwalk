import { useEffect, useState } from 'react'

/**
 * Returns a Date object that updates every minute (so insights/event labels stay fresh).
 */
export function useNow(intervalMs: number = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

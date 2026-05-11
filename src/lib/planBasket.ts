const KEY = 'cc:planBasket'
const MAX_STOPS = 4
type Listener = () => void
const listeners = new Set<Listener>()
type Toast = { id: number; msg: string }
type ToastListener = (t: Toast) => void
const toastListeners = new Set<ToastListener>()

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function write(ids: string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

function fireToast(msg: string) {
  const t: Toast = { id: Date.now(), msg }
  toastListeners.forEach((l) => l(t))
}

export const planBasket = {
  get: () => read(),
  has: (id: string) => read().includes(id),
  add: (id: string): boolean => {
    const cur = read()
    if (cur.includes(id)) return false
    if (cur.length >= MAX_STOPS) {
      fireToast(`Max ${MAX_STOPS} stops · remove one first`)
      return false
    }
    write([...cur, id])
    return true
  },
  remove: (id: string) => {
    write(read().filter((x) => x !== id))
  },
  clear: () => write([]),
  subscribe: (fn: Listener) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  subscribeToast: (fn: ToastListener) => {
    toastListeners.add(fn)
    return () => toastListeners.delete(fn)
  },
}

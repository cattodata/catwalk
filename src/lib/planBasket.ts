const KEY = 'cc:planBasket'
type Listener = () => void
const listeners = new Set<Listener>()

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

export const planBasket = {
  get: () => read(),
  has: (id: string) => read().includes(id),
  add: (id: string) => {
    const cur = read()
    if (cur.includes(id) || cur.length >= 4) return
    write([...cur, id])
  },
  remove: (id: string) => {
    write(read().filter((x) => x !== id))
  },
  clear: () => write([]),
  subscribe: (fn: Listener) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

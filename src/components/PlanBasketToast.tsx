import { useEffect, useState } from 'react'
import { planBasket } from '../lib/planBasket'

interface Toast {
  id: number
  msg: string
}

export function PlanBasketToast() {
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    const unsub = planBasket.subscribeToast((t) => {
      setToast(t)
      const timer = setTimeout(() => setToast((cur) => (cur?.id === t.id ? null : cur)), 2400)
      return () => clearTimeout(timer)
    })
    return () => {
      unsub()
    }
  }, [])

  if (!toast) return null
  return (
    <div className="cc-basket-toast" role="status" aria-live="polite">
      {toast.msg}
    </div>
  )
}

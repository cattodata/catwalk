import { useSyncExternalStore } from 'react'
import { planBasket } from '../lib/planBasket'

function getSnapshot(): string {
  return planBasket.get().join('|')
}

function getServerSnapshot(): string {
  return ''
}

export function usePlanBasket(): string[] {
  const key = useSyncExternalStore(planBasket.subscribe, getSnapshot, getServerSnapshot)
  return key ? key.split('|') : []
}

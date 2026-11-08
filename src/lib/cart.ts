import { useEffect, useState, useSyncExternalStore } from 'react'
import { site } from '../config/site'

// Koszyk sklepu w localStorage tej przegladarki (same identyfikatory produktow, ceny zawsze z serwera).
// Dokumenty kupuje sie raz, wiec kazdy produkt jest w koszyku najwyzej raz (quantity zostaje na przyszlosc).
export type CartLine = { id: string; quantity: number }

const KEY = 'sf-koszyk'
const PODGLAD = 'sf-platnosci'
const MAX_LINES = 50
const EMPTY: CartLine[] = []

let cache: CartLine[] | null = null
const listeners = new Set<() => void>()

function read(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown
    if (!Array.isArray(raw)) return EMPTY
    return raw
      .filter((l): l is CartLine => typeof l?.id === 'string' && /^[0-9a-f-]{36}$/i.test(l.id))
      .map((l) => ({ id: l.id, quantity: Number.isInteger(l.quantity) && l.quantity > 0 ? l.quantity : 1 }))
      .slice(0, MAX_LINES)
  } catch {
    return EMPTY
  }
}

function snapshot(): CartLine[] {
  if (cache === null) cache = read()
  return cache
}

function write(lines: CartLine[]) {
  cache = lines
  try {
    localStorage.setItem(KEY, JSON.stringify(lines))
  } catch {
    // brak pamieci przegladarki: koszyk dziala do odswiezenia strony
  }
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY)
}

export const cart = {
  add(id: string) {
    const lines = snapshot()
    if (lines.some((l) => l.id === id) || lines.length >= MAX_LINES) return
    write([...lines, { id, quantity: 1 }])
  },
  remove(id: string) {
    write(snapshot().filter((l) => l.id !== id))
  },
  // Zostaw tylko produkty nadal dostepne w sklepie.
  keep(ids: string[]) {
    const set = new Set(ids)
    const lines = snapshot()
    if (lines.some((l) => !set.has(l.id))) write(lines.filter((l) => set.has(l.id)))
  },
  clear() {
    write([])
  },
}

// Sklep widoczny po wlaczeniu platnosci albo w podgladzie: ?platnosci=1 zapamietane w tej karcie,
// zeby podglad dzialal tez po przejsciu na karte produktu i do koszyka.
export function useShopEnabled(): boolean {
  const [enabled, setEnabled] = useState<boolean>(site.payments.enabled)
  useEffect(() => {
    if (site.payments.enabled) return
    let podglad = new URLSearchParams(window.location.search).has('platnosci')
    try {
      if (podglad) sessionStorage.setItem(PODGLAD, '1')
      else podglad = sessionStorage.getItem(PODGLAD) === '1'
    } catch {
      // bez sessionStorage podglad tylko z ?platnosci=1 w adresie
    }
    setEnabled(podglad)
  }, [])
  return enabled
}

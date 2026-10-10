import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { site } from '../config/site'

const KLUCZ = 'sf-zgoda-analityka'
export const OTWORZ_USTAWIENIA = 'sf-ustawienia-cookies'

type Gtag = (...args: unknown[]) => void

function odczyt(): 'tak' | 'nie' | null {
  try {
    const v = localStorage.getItem(KLUCZ)
    return v === 'tak' || v === 'nie' ? v : null
  } catch {
    return null
  }
}

function zastosuj(zgoda: boolean) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  gtag?.('consent', 'update', { analytics_storage: zgoda ? 'granted' : 'denied' })
}

// Baner zgody na analityke (Google Analytics). Domyslnie odrzucona; wybor zapamietany w przegladarce.
export function CookieBanner() {
  const [widoczny, setWidoczny] = useState(false)

  useEffect(() => {
    if (!site.gaId) return
    const zapisana = odczyt()
    if (zapisana === 'tak') zastosuj(true)
    if (zapisana === null) setWidoczny(true)
    const otworz = () => setWidoczny(true)
    window.addEventListener(OTWORZ_USTAWIENIA, otworz)
    return () => window.removeEventListener(OTWORZ_USTAWIENIA, otworz)
  }, [])

  if (!site.gaId || !widoczny) return null

  const wybierz = (zgoda: boolean) => {
    try {
      localStorage.setItem(KLUCZ, zgoda ? 'tak' : 'nie')
    } catch {
      // brak dostepu do pamieci przegladarki: wybor obowiazuje do konca wizyty
    }
    zastosuj(zgoda)
    setWidoczny(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Zgoda na pliki cookie"
      className="panel fixed inset-x-4 bottom-4 z-50 max-w-xl border border-linia bg-papier p-5 shadow-xl sm:left-6 sm:right-auto sm:bottom-6"
    >
      <p className="font-naglowek text-lg font-semibold">Czy możemy mierzyć ruch na stronie?</p>
      <p className="mt-2 text-tusz-2">
        Używamy Google Analytics, żeby sprawdzać, które podstrony są czytane. Zapisuje to pliki cookie i
        wysyła dane do Google. Bez Twojej zgody nic nie zapisujemy. Szczegóły w{' '}
        <Link to="/polityka-prywatnosci" className="link">polityce prywatności</Link>.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn btn-zielony" onClick={() => wybierz(true)}>
          Zgadzam się
        </button>
        <button type="button" className="btn btn-obrys" onClick={() => wybierz(false)}>
          Nie zgadzam się
        </button>
      </div>
    </div>
  )
}

import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type FormEvent } from 'react'
import { Logo } from '../components/Logo'
import { adminClient } from '../lib/admin'
import { pageHead } from '../lib/seo'

// Panel administracyjny (produkty, pliki, podglady, zamowienia, kategorie, ustawienia). Logowanie Supabase Auth (e-mail i haslo), rola admin w profiles.
// Konta tworzymy recznie w panelu Supabase, bez publicznej rejestracji. Strona renderuje sie w przegladarce.
export const Route = createFileRoute('/admin')({
  head: () =>
    pageHead({ title: 'Panel – Safety First', description: 'Panel administracyjny Safety First.', path: '/admin', noindex: true }),
  component: AdminLayout,
})

type Stan = { kind: 'loading' } | { kind: 'guest' } | { kind: 'forbidden'; email: string } | { kind: 'admin'; email: string }

function AdminLayout() {
  const [stan, setStan] = useState<Stan>({ kind: 'loading' })

  useEffect(() => {
    const supabase = adminClient()
    async function sprawdz(session: Session | null) {
      if (!session) return setStan({ kind: 'guest' })
      const { data } = await supabase.rpc('is_admin')
      const email = session.user.email ?? ''
      setStan(data === true ? { kind: 'admin', email } : { kind: 'forbidden', email })
    }
    supabase.auth.getSession().then(({ data }) => sprawdz(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Odswiezenie tokenu nie zmienia uprawnien, nie sprawdzamy roli ponownie.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') sprawdz(session)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function wyloguj() {
    await adminClient().auth.signOut()
  }

  return (
    <div className="min-h-screen bg-mgla">
      <header className="border-b border-linia bg-white">
        <div className="kontener flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <Logo className="h-8 w-auto" />
            <span className="font-semibold text-tusz-2">Panel</span>
          </div>
          {stan.kind === 'admin' && (
            <nav aria-label="Panel" className="flex flex-wrap items-center gap-4 text-sm">
              <Link to="/admin" className="link" activeOptions={{ exact: true }}>Produkty</Link>
              <Link to="/admin/zamowienia" className="link">Zamówienia</Link>
              <Link to="/admin/kategorie" className="link">Kategorie</Link>
              <Link to="/admin/ustawienia" className="link">Ustawienia</Link>
              <span className="text-tusz-2">{stan.email}</span>
              <button type="button" className="btn btn-obrys" onClick={wyloguj}>Wyloguj</button>
            </nav>
          )}
        </div>
      </header>
      <main className="kontener py-8">
        {stan.kind === 'loading' && <p>Ładowanie…</p>}
        {stan.kind === 'guest' && <Logowanie />}
        {stan.kind === 'forbidden' && (
          <div className="panel max-w-lg">
            <p className="font-semibold">Konto {stan.email} nie ma uprawnień do panelu.</p>
            <button type="button" className="btn btn-obrys mt-4" onClick={wyloguj}>Wyloguj</button>
          </div>
        )}
        {stan.kind === 'admin' && <Outlet />}
      </main>
    </div>
  )
}

function Logowanie() {
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)
    setSending(true)
    const { error } = await adminClient().auth.signInWithPassword({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    })
    setSending(false)
    if (error) setError('Nieprawidłowy e-mail lub hasło.')
  }

  return (
    <form className="panel mx-auto mt-8 max-w-sm" onSubmit={onSubmit}>
      <h1 className="text-2xl">Logowanie</h1>
      <label htmlFor="adm-email" className="mt-6 block text-sm font-semibold">E-mail</label>
      <input id="adm-email" name="email" type="email" required autoComplete="username" className="pole mt-1 w-full" />
      <label htmlFor="adm-pass" className="mt-4 block text-sm font-semibold">Hasło</label>
      <input id="adm-pass" name="password" type="password" required autoComplete="current-password" className="pole mt-1 w-full" />
      <button type="submit" className="btn btn-glowny mt-6 w-full" disabled={sending}>
        {sending ? 'Logowanie…' : 'Zaloguj'}
      </button>
      {error && <p role="alert" className="mt-4 font-semibold text-blad">{error}</p>}
    </form>
  )
}

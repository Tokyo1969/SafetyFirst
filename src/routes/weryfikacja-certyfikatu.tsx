import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { PageHero } from '../components/blocks'
import { site } from '../config/site'
import { pageHead } from '../lib/seo'
import { normalizeDocId, verifyCertificate, type CertificateResult } from '../server/certificate'

type Search = { nr?: string }

// Weryfikacja certyfikatu / dokumentu po numerze z stopki PDF (generated_documents.doc_id). Link z numerem:
// /weryfikacja-certyfikatu?nr=SF-XXXXXXXXXXXX sprawdza od razu (np. z kodu QR na dokumencie).
export const Route = createFileRoute('/weryfikacja-certyfikatu')({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search.nr === 'string' && search.nr.length <= 40 ? { nr: search.nr } : {},
  head: () =>
    pageHead({
      title: 'Weryfikacja certyfikatu – Safety First',
      description: 'Sprawdź, czy certyfikat lub dokument wydany przez Safety First jest ważny. Wpisz numer dokumentu z jego stopki.',
      path: '/weryfikacja-certyfikatu',
    }),
  component: Weryfikacja,
})

const BLAD_OGOLNY = `Nie udało się sprawdzić dokumentu. Spróbuj za chwilę albo napisz na ${site.emails.main}.`

function dataPl(iso: string): string {
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long', timeZone: 'Europe/Warsaw' }).format(new Date(iso))
}

function Weryfikacja() {
  const { nr } = Route.useSearch()
  const navigate = useNavigate({ from: '/weryfikacja-certyfikatu' })
  const [value, setValue] = useState(nr ?? '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Extract<CertificateResult, { ok: true }> | null>(null)
  const [checked, setChecked] = useState('')

  async function check(raw: string) {
    const docId = normalizeDocId(raw)
    setError(null)
    setResult(null)
    if (docId.length < 4) {
      setError('Wpisz numer dokumentu, np. SF-D56D91F9B53C.')
      return
    }
    setSending(true)
    try {
      const res = await verifyCertificate({ data: { docId } })
      if (res.ok) {
        setResult(res)
        setChecked(docId)
      } else {
        setError(
          res.error === 'invalid'
            ? 'Numer ma nieprawidłowy format. Przepisz go ze stopki dokumentu, np. SF-D56D91F9B53C.'
            : res.error === 'limit'
              ? 'Za dużo prób w krótkim czasie. Spróbuj ponownie za kilka minut.'
              : BLAD_OGOLNY,
        )
      }
    } catch {
      setError(BLAD_OGOLNY)
    } finally {
      setSending(false)
    }
  }

  // Numer z adresu (?nr=) sprawdzamy od razu po wejsciu.
  useEffect(() => {
    if (nr) void check(nr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const docId = normalizeDocId(value)
    void navigate({ search: docId ? { nr: docId } : {}, replace: true })
    void check(value)
  }

  return (
    <main>
      <PageHero
        crumb="Weryfikacja certyfikatu"
        title="Weryfikacja certyfikatu"
        lead="Sprawdź, czy certyfikat lub dokument wydany przez Safety First jest ważny. Numer znajdziesz w stopce dokumentu."
      />
      <section className="sekcja bg-papier">
        <div className="kontener max-w-2xl">
          <form className="panel grid gap-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="nr-dokumentu" className="block text-sm font-semibold">Numer dokumentu</label>
              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                <input
                  id="nr-dokumentu"
                  name="nr"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="np. SF-D56D91F9B53C"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={40}
                  className="pole w-full font-mono uppercase"
                />
                <button type="submit" className="btn btn-glowny shrink-0" disabled={sending}>
                  {sending ? 'Sprawdzam…' : 'Sprawdź'}
                </button>
              </div>
            </div>
            {error && <p role="alert" className="rounded-xl border-l-4 border-blad bg-blad/8 p-4 font-semibold text-blad">{error}</p>}
          </form>

          <div aria-live="polite">
            {result && !result.found && (
              <div className="mt-8 rounded-2xl border-2 border-blad bg-blad/8 p-6">
                <p className="flex items-center gap-3 text-2xl font-bold text-blad">
                  <StatusIcon valid={false} />
                  Nieważny
                </p>
                <p className="mt-2">
                  Nie znaleźliśmy dokumentu o numerze <span className="font-mono font-semibold">{checked}</span>. Sprawdź, czy numer
                  jest przepisany bez błędów. W razie wątpliwości napisz na {site.emails.main}.
                </p>
              </div>
            )}
            {result && result.found && (
              <div
                className={`mt-8 rounded-2xl border-2 p-6 ${result.valid ? 'border-znak bg-znak-jasny' : 'border-blad bg-blad/8'}`}
              >
                <p className={`flex items-center gap-3 text-2xl font-bold ${result.valid ? 'text-znak-ciemny' : 'text-blad'}`}>
                  <StatusIcon valid={result.valid} />
                  {result.valid ? 'Ważny' : 'Nieważny'}
                </p>
                {!result.valid && result.reason && <p className="mt-2 font-semibold text-blad">{result.reason}</p>}
                <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
                  <dt className="text-sm font-semibold text-tusz-2">Numer dokumentu</dt>
                  <dd className="font-mono font-semibold">{result.certificate.docId}</dd>
                  <dt className="text-sm font-semibold text-tusz-2">Dokument</dt>
                  <dd>{result.certificate.title}</dd>
                  {result.certificate.company && (
                    <>
                      <dt className="text-sm font-semibold text-tusz-2">Wydany dla</dt>
                      <dd>{result.certificate.company}</dd>
                    </>
                  )}
                  <dt className="text-sm font-semibold text-tusz-2">Data wydania</dt>
                  <dd>{dataPl(result.certificate.issuedAt)}</dd>
                  {result.certificate.version != null && (
                    <>
                      <dt className="text-sm font-semibold text-tusz-2">Wersja wzoru</dt>
                      <dd>{result.certificate.version}</dd>
                    </>
                  )}
                  <dt className="text-sm font-semibold text-tusz-2">Wydawca</dt>
                  <dd>{site.brand}, {site.company.name}</dd>
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function StatusIcon({ valid }: { valid: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-8 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      {valid ? (
        <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      )}
    </svg>
  )
}

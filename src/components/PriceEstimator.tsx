import { useState } from 'react'
import { BANDS, INDUSTRIES, formatPln, priceFor } from '../data/pricing'

const field = 'pole'

export function PriceEstimator({ initialIndustry }: { initialIndustry?: string }) {
  const [industry, setIndustry] = useState(
    INDUSTRIES.some((i) => i.id === initialIndustry) ? (initialIndustry as string) : INDUSTRIES[0].id,
  )
  const [band, setBand] = useState(0)
  const price = priceFor(industry, band)
  const note = INDUSTRIES.find((i) => i.id === industry)?.note

  return (
    <div className="panel grid overflow-hidden md:grid-cols-[1.2fr_1fr]">
      <div className="grid content-start gap-5 p-6 sm:p-8">
        <div>
          <label htmlFor="e-industry" className="etykieta">Branża</label>
          <select id="e-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={field}>
            {INDUSTRIES.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="e-band" className="etykieta">Liczba osób w firmie</label>
          <select id="e-band" value={band} onChange={(e) => setBand(Number(e.target.value))} className={field}>
            {BANDS.map((b, i) => (
              <option key={b} value={i}>{b}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col justify-center bg-znak-jasny p-6 sm:p-8">
        <p className="text-tusz-2">Abonament miesięcznie</p>
        <p aria-live="polite" className="mt-1 font-naglowek text-5xl font-bold tracking-tight text-znak-ciemny">
          {price !== null && <>od {formatPln(price)} zł</>}
        </p>
        <p className="mt-1 font-semibold">netto</p>
        {note && <p className="mt-3 text-tusz-2">{note}</p>}
        <p className="mt-4 text-sm text-tusz-2">
          Cena orientacyjna. Dokładną wycenę podajemy po krótkiej rozmowie o Twojej firmie.
        </p>
      </div>
    </div>
  )
}

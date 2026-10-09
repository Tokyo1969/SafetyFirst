import { useState } from 'react'
import { BANDS, INDUSTRIES, formatPln, priceFor } from '../data/pricing'

const field = 'mt-1 block w-full border border-tusz-2 bg-white px-3 py-2 font-tekst text-base text-tusz'

export function PriceEstimator() {
  const [industry, setIndustry] = useState(INDUSTRIES[0].id)
  const [band, setBand] = useState(0)
  const price = priceFor(industry, band)
  const note = INDUSTRIES.find((i) => i.id === industry)?.note

  return (
    <div className="border-2 border-tusz bg-white p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="e-industry" className="block font-naglowek text-lg font-semibold">Branża</label>
          <select id="e-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={field}>
            {INDUSTRIES.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="e-band" className="block font-naglowek text-lg font-semibold">Liczba osób w firmie</label>
          <select id="e-band" value={band} onChange={(e) => setBand(Number(e.target.value))} className={field}>
            {BANDS.map((b, i) => (
              <option key={b} value={i}>{b}</option>
            ))}
          </select>
        </div>
      </div>
      <p aria-live="polite" className="mt-6 font-naglowek text-4xl font-bold">
        {price !== null && (
          <>
            od {formatPln(price)} zł <span className="text-xl font-semibold text-tusz-2">netto miesięcznie</span>
          </>
        )}
      </p>
      {note && <p className="mt-2 text-tusz-2">{note}</p>}
      <p className="mt-4 text-sm text-tusz-2">
        Cena orientacyjna. Dokładną wycenę podajemy po krótkiej rozmowie o Twojej firmie.
      </p>
    </div>
  )
}

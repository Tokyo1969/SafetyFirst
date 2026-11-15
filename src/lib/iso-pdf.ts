// Generowanie PDF wniosku o certyfikacje w przegladarce (pdf-lib + fontkit, IBM Plex Sans z public/fonts).
// Nic nie jest wysylane na serwer. Moduly ladowane dynamicznie, zeby nie powiekszac strony.
import {
  DZIALANIA,
  ELEMENTY_ZINTEGROWANE,
  INNE_OKOLICZNOSCI,
  type TakNie,
  type WniosekDane,
} from '../data/iso-wniosek'

const W = 595.28
const H = 841.89
const M = 48
const TUSZ = [0.114, 0.169, 0.243] as const
const ZNAK = [0.137, 0.439, 0.2] as const
const SZARY = [0.4, 0.44, 0.5] as const
const LINIA = [0.82, 0.85, 0.88] as const

async function bytes(url: string): Promise<Uint8Array> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Nie udało się wczytać czcionki (${r.status}).`)
  return new Uint8Array(await r.arrayBuffer())
}

function tn(v: TakNie): string {
  return v === 'tak' ? 'Tak' : v === 'nie' ? 'Nie' : '-'
}

export function formatDataPl(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso
}

export async function zbudujWniosekPdf(d: WniosekDane): Promise<Uint8Array> {
  const [{ PDFDocument, rgb }, fk] = await Promise.all([import('pdf-lib'), import('@pdf-lib/fontkit')])
  const [reg, semi] = await Promise.all([
    bytes('/fonts/IBMPlexSans_400Regular.ttf'),
    bytes('/fonts/IBMPlexSans_600SemiBold.ttf'),
  ])
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fk.default)
  const f = await pdf.embedFont(reg, { subset: true })
  const fb = await pdf.embedFont(semi, { subset: true })
  pdf.setTitle(`Wniosek o certyfikację systemu zarządzania ${d.norma}`)
  pdf.setSubject(`Wniosek o certyfikację ${d.norma}`)
  pdf.setCreator('safetyfirst.opole.pl')
  pdf.setProducer('safetyfirst.opole.pl')

  const col = (c: readonly [number, number, number]) => rgb(c[0], c[1], c[2])
  let page = pdf.addPage([W, H])
  let y = H - M

  const wrap = (text: string, font: typeof f, size: number, width: number): string[] => {
    const out: string[] = []
    for (const para of (text || '-').split(/\r?\n/)) {
      let line = ''
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const test = line ? `${line} ${word}` : word
        if (font.widthOfTextAtSize(test, size) <= width) {
          line = test
        } else {
          if (line) out.push(line)
          // bardzo dlugie slowo: lamiemy co znak
          let rest = word
          while (font.widthOfTextAtSize(rest, size) > width) {
            let n = rest.length
            while (n > 1 && font.widthOfTextAtSize(rest.slice(0, n), size) > width) n--
            out.push(rest.slice(0, n))
            rest = rest.slice(n)
          }
          line = rest
        }
      }
      out.push(line)
    }
    return out
  }

  const need = (h: number) => {
    if (y - h < M + 28) {
      page = pdf.addPage([W, H])
      y = H - M
    }
  }

  // Naglowek dokumentu
  page.drawRectangle({ x: 0, y: H - 14, width: W, height: 14, color: rgb(1, 0.78, 0.17) })
  y = H - 14 - 38
  page.drawText('Wniosek o certyfikację systemu zarządzania', { x: M, y, size: 18, font: fb, color: col(TUSZ) })
  y -= 22
  page.drawText(`Norma: ${d.norma}`, { x: M, y, size: 12, font: fb, color: col(ZNAK) })
  y -= 16
  page.drawText(`Data wypełnienia wniosku: ${formatDataPl(d.data)}`, { x: M, y, size: 10, font: f, color: col(SZARY) })
  y -= 22

  const section = (title: string, minAfter = 0) => {
    need(62 + minAfter)
    y -= 6
    page.drawText(title, { x: M, y, size: 12, font: fb, color: col(TUSZ) })
    y -= 5
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: col(LINIA) })
    y -= 15
  }

  const LW = 190
  const VX = M + LW + 12
  const VW = W - M - VX
  const row = (label: string, value: string) => {
    const l = wrap(label, f, 9, LW)
    const v = wrap(value, f, 10.5, VW)
    const lines = Math.max(l.length, v.length)
    need(lines * 14 + 6)
    l.forEach((t, i) => page.drawText(t, { x: M, y: y - i * 12, size: 9, font: f, color: col(SZARY) }))
    v.forEach((t, i) => page.drawText(t, { x: VX, y: y - i * 14, size: 10.5, font: f, color: col(TUSZ) }))
    y -= lines * 14 + 4
  }

  const check = (label: string, on: boolean) => {
    const l = wrap(label, f, 10, W - 2 * M - 90)
    need(l.length * 13 + 6)
    l.forEach((t, i) => page.drawText(t, { x: M, y: y - i * 13, size: 10, font: f, color: col(TUSZ) }))
    page.drawText(on ? 'Tak' : 'Nie', {
      x: W - M - 40,
      y,
      size: 10,
      font: on ? fb : f,
      color: on ? col(ZNAK) : col(SZARY),
    })
    y -= l.length * 13 + 5
  }

  section('Dane organizacji')
  row('Nazwa organizacji', d.nazwa)
  row('NIP', d.nip)
  row('Adres rejestrowy', d.adres)
  row('Imię i nazwisko osoby wypełniającej', d.osobaWypelniajaca)

  section('Osoba kontaktowa')
  row('Imię i nazwisko', d.osobaKontaktowa)
  row('Telefon', d.telefon)
  row('E-mail', d.email)

  section('Wdrożenie systemu')
  row('Nazwa firmy wdrożeniowej', d.firmaWdrozeniowa || '-')
  row('Osoba, która prowadziła konsultacje w firmie', d.konsultant || '-')

  section('Zakres i wielkość organizacji')
  row('Zakres certyfikacji (rodzaj działalności)', d.zakres || '-')
  row('Liczba pracowników', d.pracownicy || '-')
  row('Liczba lokalizacji', d.lokalizacje || '-')

  section('Dotychczasowa certyfikacja')
  row('Czy organizacja posiada ważny certyfikat (dotyczy wyłącznie nowych klientów)?', tn(d.certyfikat))
  if (d.certyfikat === 'tak') {
    row('Jednostka certyfikująca', d.jednostka || '-')
    row('Data ważności certyfikatu', d.waznoscDo ? formatDataPl(d.waznoscDo) : '-')
    row(
      'Czy w ostatnim 3-letnim cyklu wystąpiły duże niezgodności? (dotyczy wyłącznie transferu z innej jednostki)',
      tn(d.niezgodnosci),
    )
  }

  section('Zintegrowany system zarządzania', d.zintegrowany === 'tak' ? 90 : 0)
  row('Czy certyfikacja ma być zintegrowana w ramach Zintegrowanego Systemu Zarządzania?', tn(d.zintegrowany))
  if (d.zintegrowany === 'tak') {
    need(24)
    page.drawText('Które elementy systemu są zintegrowane:', { x: M, y, size: 9, font: f, color: col(SZARY) })
    y -= 15
    for (const e of ELEMENTY_ZINTEGROWANE) check(e, d.elementy.includes(e))
  }

  section('Czy występują u Państwa następujące działania?')
  for (const e of DZIALANIA) check(e, d.dzialania.includes(e))

  section('Inne okoliczności wpływające na czas auditu')
  for (const e of INNE_OKOLICZNOSCI) check(e, d.inne.includes(e))

  // Stopka na kazdej stronie
  const pages = pdf.getPages()
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: M - 6 }, end: { x: W - M, y: M - 6 }, thickness: 0.5, color: col(LINIA) })
    p.drawText('Wygenerowano na safetyfirst.opole.pl', { x: M, y: M - 20, size: 8, font: f, color: col(SZARY) })
    const t = `Strona ${i + 1} z ${pages.length}`
    p.drawText(t, { x: W - M - f.widthOfTextAtSize(t, 8), y: M - 20, size: 8, font: f, color: col(SZARY) })
  })

  return pdf.save()
}

import { marked } from 'marked'

// Dokument prawny z pliku Markdown (src/content). Tresc pochodzi z repozytorium, nie od uzytkownikow,
// wiec HTML z markeda wstawiamy bez dodatkowego oczyszczania.
export function LegalDocument({ markdown, children }: { markdown: string; children?: React.ReactNode }) {
  const html = marked.parse(markdown, { async: false, gfm: true })
  return (
    <main className="kontener max-w-3xl py-16 md:py-24">
      {children}
      <div className="dokument" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}

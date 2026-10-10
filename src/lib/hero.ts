// Grafiki naglowkow podstron: src/assets/hero/<klucz>.(jpg|webp|png).
// Klucz = slug uslugi albo nazwa strony (obsluga-bhp, ochrona-srodowiska, cennik, dla-branz, o-nas, kontakt).
// Brak pliku = naglowek bez grafiki (uklad sie nie zmienia).
const files = import.meta.glob('../assets/hero/*.{jpg,jpeg,webp,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const byKey: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const key = path.split('/').pop()?.replace(/\.[^.]+$/, '')
  if (key) byKey[key] = url
}

export function heroImage(key: string): string | undefined {
  return byKey[key]
}

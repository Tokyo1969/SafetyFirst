import { createFileRoute } from '@tanstack/react-router'
import { LegalDocument } from '../components/LegalDocument'
import polityka from '../content/polityka-prywatnosci.md?raw'
import { pageHead } from '../lib/seo'

// Polityka prywatnosci (tresc od Natalii, src/content/polityka-prywatnosci.md). Po zmianie narzedzi na stronie
// (analityka, nowi dostawcy) zaktualizuj punkty 3 i 6.
export const Route = createFileRoute('/polityka-prywatnosci')({
  head: () =>
    pageHead({
      title: 'Polityka prywatności – Safety First',
      description: 'Polityka prywatności serwisu i sklepu Safety First.',
      path: '/polityka-prywatnosci',
      noindex: true,
    }),
  component: () => <LegalDocument markdown={polityka} />,
})

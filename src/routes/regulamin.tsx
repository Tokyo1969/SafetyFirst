import { createFileRoute } from '@tanstack/react-router'
import { LegalDocument } from '../components/LegalDocument'
import regulamin from '../content/regulamin.md?raw'
import { pageHead } from '../lib/seo'

// Regulamin sklepu (tresc od Natalii, src/content/regulamin.md). Po zmianie tresci podnies wersje w panelu
// (Ustawienia > Wersja regulaminu), bo jest zapisywana w kazdym zamowieniu.
export const Route = createFileRoute('/regulamin')({
  head: () =>
    pageHead({
      title: 'Regulamin sklepu – Safety First',
      description: 'Regulamin sklepu internetowego Safety First: zamówienia, płatności, licencja, odstąpienie od umowy i reklamacje.',
      path: '/regulamin',
      noindex: true,
    }),
  component: () => <LegalDocument markdown={regulamin} />,
})

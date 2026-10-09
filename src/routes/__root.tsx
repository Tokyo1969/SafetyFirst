/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { site } from '../config/site'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${site.brand} – ${site.tagline} dla małych firm z Opola` },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-5 py-24">
      <h1 className="text-4xl">Nie ma takiej strony</h1>
      <p className="mt-4">Wróć na stronę główną albo napisz do nas: {site.emails.main}.</p>
    </main>
  ),
})

function RootComponent() {
  return (
    <RootDocument>
      <Header />
      <Outlet />
      <Footer />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

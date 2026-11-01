/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { CookieBanner } from '../components/CookieBanner'
import { ChatWidget } from '../components/ChatWidget'
import { site } from '../config/site'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#ffffff' },
      { title: `${site.brand} – ${site.tagline} dla małych firm` },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
    scripts: site.gaId
      ? [
          // Zgoda domyslnie odrzucona (Consent Mode v2): bez ciasteczek analitycznych do czasu banera zgody.
          {
            children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${site.gaId}');`,
          },
          { src: `https://www.googletagmanager.com/gtag/js?id=${site.gaId}`, async: true },
        ]
      : [],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <main className="kontener max-w-3xl py-24">
      <h1>Nie ma takiej strony</h1>
      <p className="mt-4 text-lg">Wróć na stronę główną albo napisz do nas: {site.emails.main}.</p>
      <a href="/" className="btn btn-glowny mt-8">Przejdź na stronę główną</a>
    </main>
  ),
})

function RootComponent() {
  // Panel /admin ma wlasny uklad: bez naglowka, stopki, banera cookies i asystenta.
  const admin = useRouterState({ select: (s) => s.location.pathname.startsWith('/admin') })
  return (
    <RootDocument>
      {admin ? (
        <Outlet />
      ) : (
        <>
          <Header />
          <Outlet />
          <Footer />
          <CookieBanner />
          <ChatWidget />
        </>
      )}
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

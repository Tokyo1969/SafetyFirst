export const API_CATALOG_PATH = '/.well-known/api-catalog'
export const API_CATALOG_LINK = `<${API_CATALOG_PATH}>; rel="api-catalog"; type="application/linkset+json"`

export function apiCatalogResponse(request: Request): Response {
  const headers = new Headers({
    'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    Link: API_CATALOG_LINK,
    'Cache-Control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  })

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // No public APIs yet. TanStack server functions are internal, not stable API endpoints.
  return new Response(request.method === 'HEAD' ? null : JSON.stringify({ linkset: [] }), { headers })
}

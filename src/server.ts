import serverEntry, { createServerEntry } from '@tanstack/react-start/server-entry'
import { handleMarkdownRequest } from './server/markdown'
import { API_CATALOG_LINK, API_CATALOG_PATH, apiCatalogResponse } from './server/api-catalog'

export default createServerEntry({
  fetch: async (request, options) => {
    const path = new URL(request.url).pathname
    if (path === API_CATALOG_PATH) return apiCatalogResponse(request)
    const response = await handleMarkdownRequest(request, (htmlRequest) => serverEntry.fetch(htmlRequest, options))
    if (path !== '/' || (request.method !== 'GET' && request.method !== 'HEAD')) return response

    // Append rather than replace any preload or other discovery links from SSR.
    const headers = new Headers(response.headers)
    headers.append('Link', API_CATALOG_LINK)
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
})

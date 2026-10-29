import { NodeHtmlMarkdown } from 'node-html-markdown'
import { parse } from 'node-html-parser'

function prefersMarkdown(accept: string): boolean {
  const types = new Map<string, number>()
  for (const range of accept.toLowerCase().split(',')) {
    const [type, ...parameters] = range.trim().split(';')
    const quality = parameters.find((parameter) => parameter.trim().startsWith('q='))
    const value = quality ? Number(quality.trim().slice(2)) : 1
    const weight = Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0
    types.set(type.trim(), Math.max(types.get(type.trim()) ?? 0, weight))
  }

  const markdown = types.get('text/markdown') ?? 0
  const html = types.get('text/html') ?? types.get('text/*') ?? types.get('*/*') ?? 0
  return markdown > 0 && markdown >= html
}

export function pageMarkdown(html: string, url: string): string {
  const document = parse(html)
  const content = document.querySelector('main') ?? document.querySelector('body') ?? document
  for (const element of content.querySelectorAll(
    'script, style, noscript, svg, nav, header, footer, form, button, [hidden], [aria-hidden="true"]',
  )) {
    element.remove()
  }
  for (const element of content.querySelectorAll('a[href], img[src]')) {
    const attribute = element.tagName === 'A' ? 'href' : 'src'
    const target = element.getAttribute(attribute)
    if (target) element.setAttribute(attribute, new URL(target, url).href)
  }
  for (const image of content.querySelectorAll('img')) {
    if (!image.getAttribute('alt')?.trim()) image.remove()
  }

  return `${NodeHtmlMarkdown.translate(content.innerHTML, { bulletMarker: '-', maxConsecutiveNewlines: 2 }).trim()}\n`
}

export async function handleMarkdownRequest(
  request: Request,
  fetchHtml: (request: Request) => Promise<Response> | Response,
): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return fetchHtml(request)

  const markdown = prefersMarkdown(request.headers.get('Accept') ?? '')
  let htmlRequest = request
  if (markdown) {
    const headers = new Headers(request.headers)
    headers.set('Accept', 'text/html')
    // Validators and byte ranges for HTML cannot describe the Markdown variant.
    for (const header of ['If-None-Match', 'If-Modified-Since', 'If-Range', 'Range']) {
      headers.delete(header)
    }
    htmlRequest = new Request(request, { method: 'GET', headers })
  }

  const response = await fetchHtml(htmlRequest)
  if (response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'text/html') {
    if (request.method === 'HEAD' && markdown) {
      await response.body?.cancel()
      return new Response(null, response)
    }
    return response
  }

  const headers = new Headers(response.headers)
  const vary = headers.get('Vary')?.split(',').map((value) => value.trim()) ?? []
  if (!vary.some((value) => value === '*' || value.toLowerCase() === 'accept')) {
    headers.set('Vary', [...vary, 'Accept'].join(', '))
  }

  if (!markdown || !response.body) {
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
  }

  const body = pageMarkdown(await response.text(), request.url)
  headers.set('Content-Type', 'text/markdown; charset=utf-8')
  headers.set('Content-Signal', 'ai-train=no, search=yes, ai-input=no')
  for (const header of [
    'Content-Length', 'Content-Encoding', 'Content-Range', 'Transfer-Encoding', 'ETag', 'Last-Modified',
  ]) {
    headers.delete(header)
  }
  return new Response(request.method === 'HEAD' ? null : body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

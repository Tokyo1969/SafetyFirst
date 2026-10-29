import assert from 'node:assert/strict'
import { test } from 'node:test'
import { handleMarkdownRequest, pageMarkdown } from '../src/server/markdown.ts'

const html = `<!doctype html><html><head><title>Page title</title><style>body{color:red}</style></head>
<body><header>Site navigation</header><main><h1>Service</h1><p>Real &amp; current content.</p>
<h2>Scope</h2><ul><li>Training</li><li>Audit</li></ul>
<a href="/kontakt#konsultacja">Contact</a><a href="mailto:biuro@example.com">Email</a>
<details><summary>Question?</summary><p>Answer.</p></details>
<table><thead><tr><th>Service</th><th>Price</th></tr></thead>
<tbody><tr><td>Training</td><td>From 100</td></tr></tbody></table>
<div hidden>Hidden text</div><div aria-hidden="true">Decoration</div>
<svg><text>Icon</text></svg><form>Form controls</form>
<img src="/decoration.jpg" alt=""><script>secretBootstrap()</script></main>
<footer>Footer links</footer><button>Open chat</button></body></html>`

function request(accept, options = {}) {
  const headers = new Headers(options.headers)
  if (accept !== undefined) headers.set('Accept', accept)
  return new Request('https://example.com/services', { ...options, headers })
}

function htmlResponse(headers = {}, status = 200) {
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers } })
}

test('converts real page content, lists, links, FAQ answers and tables without page chrome', () => {
  const body = pageMarkdown(html, 'https://example.com/services')
  for (const text of [
    '# Service', 'Real & current content.', '## Scope', '- Training', '- Audit',
    '[Contact](https://example.com/kontakt#konsultacja)', 'mailto:biuro@example.com',
    'Question?', 'Answer.',
  ]) assert.ok(body.includes(text), text)
  assert.match(body, /\| Service +\| Price +\|/)
  assert.match(body, /\| Training +\| From 100 +\|/)
  assert.doesNotMatch(body, /Site navigation|Footer links|Open chat|Hidden text|Decoration|Icon|Form controls|secretBootstrap|<[^>]+>/)
})

test('converts only explicitly accepted Markdown, respecting quality and HTML preference', async () => {
  for (const [accept, expected] of [
    ['text/markdown', true],
    ['text/markdown; charset=utf-8', true],
    ['text/html, text/markdown', true],
    ['TEXT/MARKDOWN', true],
    ['text/markdown;q=0.9, text/html;q=0.5', true],
    [undefined, false],
    ['*/*', false],
    ['text/*', false],
    ['text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', false],
    ['text/markdown;q=0', false],
    ['text/markdown;q=invalid', false],
    ['text/markdown;q=2', false],
    ['text/markdown;q=0.5, text/html', false],
    ['text/markdown;q=0.5, */*', false],
  ]) {
    const response = await handleMarkdownRequest(request(accept), () => htmlResponse())
    assert.equal(response.headers.get('Content-Type')?.startsWith('text/markdown'), expected, String(accept))
    assert.equal(response.headers.get('Vary'), 'Accept')
    if (!expected) assert.equal(await response.text(), html)
  }
})

test('requests HTML upstream, strips HTML validators and preserves safe headers and status', async () => {
  const response = await handleMarkdownRequest(request('text/markdown', {
    headers: { 'If-None-Match': '"html"', 'If-Modified-Since': 'yesterday', Range: 'bytes=0-10', 'If-Range': '"html"' },
  }), (upstream) => {
    assert.equal(upstream.headers.get('Accept'), 'text/html')
    for (const name of ['If-None-Match', 'If-Modified-Since', 'Range', 'If-Range']) {
      assert.equal(upstream.headers.get(name), null)
    }
    return htmlResponse({
      Vary: 'Accept-Encoding', ETag: '"html"', 'Last-Modified': 'yesterday',
      'Content-Length': '1000', 'Content-Encoding': 'gzip', 'Content-Range': 'bytes 0-10/1000',
      'Transfer-Encoding': 'chunked', 'Cache-Control': 'private', 'X-Content-Type-Options': 'nosniff',
    }, 404)
  })
  assert.equal(response.status, 404)
  assert.equal(response.headers.get('Content-Type'), 'text/markdown; charset=utf-8')
  assert.equal(response.headers.get('Content-Signal'), 'ai-train=no, search=yes, ai-input=no')
  assert.equal(response.headers.get('Vary'), 'Accept-Encoding, Accept')
  assert.equal(response.headers.get('Cache-Control'), 'private')
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
  for (const name of ['ETag', 'Last-Modified', 'Content-Length', 'Content-Encoding', 'Content-Range', 'Transfer-Encoding']) {
    assert.equal(response.headers.get(name), null, name)
  }
})

test('preserves existing Vary: Accept and Vary: *', async () => {
  for (const vary of ['accept, Cookie', '*']) {
    const response = await handleMarkdownRequest(request('text/markdown'), () => htmlResponse({ Vary: vary }))
    assert.equal(response.headers.get('Vary'), vary)
  }
})

test('HEAD returns Markdown headers without a body', async () => {
  const response = await handleMarkdownRequest(request('text/markdown', { method: 'HEAD' }), (upstream) => {
    assert.equal(upstream.method, 'GET')
    return htmlResponse()
  })
  assert.equal(response.headers.get('Content-Type'), 'text/markdown; charset=utf-8')
  assert.equal(await response.text(), '')
})

test('leaves non-HTML, redirects and POST responses unchanged', async () => {
  for (const original of [
    new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }),
    new Response('<urlset/>', { headers: { 'Content-Type': 'application/xml' } }),
    new Response(null, { status: 302, headers: { Location: '/kontakt' } }),
  ]) {
    assert.equal(await handleMarkdownRequest(request('text/markdown'), () => original), original)
  }
  const original = htmlResponse()
  const post = request('text/markdown', { method: 'POST', body: 'data' })
  assert.equal(await handleMarkdownRequest(post, (upstream) => {
    assert.equal(upstream, post)
    return original
  }), original)
})

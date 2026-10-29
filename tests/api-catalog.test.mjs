import assert from 'node:assert/strict'
import { test } from 'node:test'
import { API_CATALOG_PATH, apiCatalogResponse } from '../src/server/api-catalog.ts'

const url = `https://safetyfirst.opole.pl${API_CATALOG_PATH}`

test('GET publishes an empty catalog with the RFC media type and profile', async () => {
  const response = apiCatalogResponse(new Request(url))
  assert.equal(response.status, 200)
  assert.equal(
    response.headers.get('Content-Type'),
    'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
  )
  assert.deepEqual(await response.json(), { linkset: [] })
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=3600')
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
})

test('HEAD provides catalog discovery headers and no response body', async () => {
  const response = apiCatalogResponse(new Request(url, { method: 'HEAD' }))
  assert.equal(response.status, 200)
  assert.equal(
    response.headers.get('Link'),
    `<${API_CATALOG_PATH}>; rel="api-catalog"; type="application/linkset+json"`,
  )
  assert.equal(response.headers.get('Content-Type'), apiCatalogResponse(new Request(url)).headers.get('Content-Type'))
  assert.equal(await response.text(), '')
})

test('Markdown requests still receive the JSON catalog', async () => {
  const response = apiCatalogResponse(new Request(url, { headers: { Accept: 'text/markdown' } }))
  assert.match(response.headers.get('Content-Type'), /^application\/linkset\+json/)
  assert.deepEqual(await response.json(), { linkset: [] })
})

test('unsupported methods are explicitly rejected', async () => {
  for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
    const response = apiCatalogResponse(new Request(url, { method }))
    assert.equal(response.status, 405)
    assert.equal(response.headers.get('Allow'), 'GET, HEAD')
    assert.equal(await response.text(), 'Method Not Allowed')
  }
})

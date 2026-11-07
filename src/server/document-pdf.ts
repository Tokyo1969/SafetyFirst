// Spersonalizowane PDF-y dla kupujacego: po oplaceniu zamowienia webhook Stripe wywoluje workflow n8n
// (POST N8N_PDF_WEBHOOK_URL, naglowek X-SAFETYFIRST-TOKEN = N8N_PDF_WEBHOOK_TOKEN, body { order_id }).
// Workflow zapisuje pliki w buckecie product-files i wiersze w generated_documents (jeden na order_item_id),
// a pozycje bez wgranego pliku pomija; dla nich pobieranie wydaje dalej plik z product_files (src/server/download.ts).
// Ponowienie jest bezpieczne (workflow nadpisuje wynik). Blad lub timeout tylko logujemy: nie blokuje
// potwierdzenia platnosci ani maila.

type GeneratedDocument = { doc_id?: string; storage_path?: string; order_item_id?: string }

// W tle (po odpowiedzi do Stripe) workflow ma ok. 30 s; gdy waitUntil jest niedostepne, czekamy krocej,
// zeby nie wydluzac odpowiedzi webhooka.
const BACKGROUND_TIMEOUT_MS = 25_000
const INLINE_TIMEOUT_MS = 8_000

async function callWorkflow(orderId: string, timeoutMs: number): Promise<void> {
  const url = process.env.N8N_PDF_WEBHOOK_URL
  const token = process.env.N8N_PDF_WEBHOOK_TOKEN
  if (!url || !token) {
    console.warn('document-pdf: brak N8N_PDF_WEBHOOK_URL lub N8N_PDF_WEBHOOK_TOKEN, pomijam', orderId)
    return
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-SAFETYFIRST-TOKEN': token },
      body: JSON.stringify({ order_id: orderId }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    const body = await response.text()
    if (!response.ok) {
      console.error('document-pdf: n8n odpowiedzial', response.status, orderId, body.slice(0, 500))
      return
    }
    let documents: GeneratedDocument[] = []
    try {
      const parsed = JSON.parse(body) as { documents?: GeneratedDocument[] }
      documents = Array.isArray(parsed.documents) ? parsed.documents : []
    } catch {
      console.error('document-pdf: odpowiedz n8n nie jest JSON-em', orderId, body.slice(0, 500))
      return
    }
    console.log('document-pdf: wygenerowano', documents.length, 'dokument(y) dla zamowienia', orderId)
  } catch (e) {
    console.error('document-pdf: wywolanie n8n nie powiodlo sie', orderId, e)
  }
}

// Uruchamia generowanie bez blokowania webhooka: w Workerze przez waitUntil (dziala po wyslaniu odpowiedzi),
// a gdy go brak, czeka najwyzej INLINE_TIMEOUT_MS. Nigdy nie rzuca wyjatku.
export async function requestPersonalizedDocuments(orderId: string): Promise<void> {
  try {
    const workers = (await import('cloudflare:workers')) as { waitUntil?: (p: Promise<unknown>) => void }
    if (typeof workers.waitUntil === 'function') {
      workers.waitUntil(callWorkflow(orderId, BACKGROUND_TIMEOUT_MS))
      return
    }
  } catch {
    // poza Workerem (np. testy w Node) modul nie istnieje
  }
  await callWorkflow(orderId, INLINE_TIMEOUT_MS)
}

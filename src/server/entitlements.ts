import { findOrCreateUser } from './auth-admin'
import { adminRest } from './supabase-admin'

// Dostep do kupionych produktow po oplaceniu (regulamin §6 ust. 1-2), wywolywany z webhooka Stripe:
// konto na adres z zamowienia (istniejace albo nowe), orders.user_id, entitlements z limitem pobran z app_settings,
// dane firmy do profilu (gdy puste). Pakiet = dostep do kazdego dokumentu z pakietu. Szkolenia stacjonarne bez dostepu.
// Powtorne wywolanie niczego nie dubluje (unikalne user_id + product_id).

type OrderForGrant = {
  id: string
  status: string
  user_id: string | null
  buyer_email: string
  buyer_name: string | null
  buyer_company: string | null
  buyer_nip: string | null
  order_items: { id: string; product_id: string | null; products: { type: string } | null }[]
}

export async function grantOrderAccess(orderId: string): Promise<boolean> {
  const res = await adminRest(
    `orders?select=id,status,user_id,buyer_email,buyer_name,buyer_company,buyer_nip,order_items(id,product_id,products(type))&id=eq.${orderId}`,
  )
  if (!res.ok) {
    console.error('entitlements: zamowienie', res.status, await res.text())
    return false
  }
  const order = ((await res.json()) as OrderForGrant[])[0]
  if (!order || order.status !== 'paid') return true

  const userId = order.user_id ?? (await findOrCreateUser(order.buyer_email, order.buyer_name))
  if (!userId) return false
  if (!order.user_id) {
    const link = await adminRest(`orders?id=eq.${order.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { user_id: userId } })
    if (!link.ok) {
      console.error('entitlements: powiazanie konta', link.status, await link.text())
      return false
    }
  }

  const settingsRes = await adminRest('app_settings?select=max_downloads_per_item')
  const limit = settingsRes.ok ? ((await settingsRes.json()) as { max_downloads_per_item: number }[])[0]?.max_downloads_per_item : undefined

  const rows: { user_id: string; product_id: string; order_item_id: string; download_limit: number | null }[] = []
  for (const item of order.order_items) {
    if (!item.product_id) continue
    const type = item.products?.type
    if (type === 'bundle') {
      const itemsRes = await adminRest(`bundle_items?select=item_id&bundle_id=eq.${item.product_id}`)
      if (!itemsRes.ok) return false
      for (const b of (await itemsRes.json()) as { item_id: string }[]) {
        rows.push({ user_id: userId, product_id: b.item_id, order_item_id: item.id, download_limit: limit ?? null })
      }
    } else if (type === 'document' || type === 'training_online') {
      rows.push({ user_id: userId, product_id: item.product_id, order_item_id: item.id, download_limit: limit ?? null })
    }
  }
  if (rows.length) {
    const grant = await adminRest('entitlements?on_conflict=user_id,product_id', {
      method: 'POST',
      prefer: 'resolution=ignore-duplicates,return=minimal',
      body: rows,
    })
    if (!grant.ok) {
      console.error('entitlements: nadanie dostepu', grant.status, await grant.text())
      return false
    }
  }

  // Dane do faktury w profilu, zeby klient widzial je w Koncie (tylko puste pola, bez nadpisywania jego zmian).
  const profileRes = await adminRest(`profiles?select=full_name,company_name,nip&id=eq.${userId}`)
  const profile = profileRes.ok ? ((await profileRes.json()) as { full_name: string | null; company_name: string | null; nip: string | null }[])[0] : undefined
  if (profile) {
    const nip = (order.buyer_nip ?? '').replace(/^PL/i, '').replace(/\D/g, '')
    const patch = {
      ...(!profile.full_name && order.buyer_name ? { full_name: order.buyer_name } : {}),
      ...(!profile.company_name && order.buyer_company ? { company_name: order.buyer_company } : {}),
      ...(!profile.nip && /^\d{10}$/.test(nip) ? { nip } : {}),
    }
    if (Object.keys(patch).length) {
      await adminRest(`profiles?id=eq.${userId}`, { method: 'PATCH', prefer: 'return=minimal', body: patch }).catch(() => undefined)
    }
  }
  return true
}

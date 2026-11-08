import { Link } from '@tanstack/react-router'
import { cart, useCart } from '../lib/cart'
import { formatGrosze, unitGrossCents } from '../lib/shop'
import type { CatalogProduct } from '../server/shop'

// Wspolne elementy sklepu (/sklep, /sklep/<slug>, /koszyk, naglowek).

export function docTypeLabel(p: Pick<CatalogProduct, 'type' | 'doc_type'>): string {
  if (p.type === 'bundle') return 'Pakiet dokumentów'
  if (!p.doc_type) return 'Dokument'
  return p.doc_type.charAt(0).toUpperCase() + p.doc_type.slice(1)
}

export function Price({ net, vat, size = 'md' }: { net: number; vat: number; size?: 'md' | 'lg' }) {
  return (
    <p>
      <span className={size === 'lg' ? 'text-3xl font-semibold' : 'text-xl font-semibold'}>{formatGrosze(net)}</span>{' '}
      <span className="text-sm">netto</span>
      <span className="block text-sm text-tusz-2">{formatGrosze(unitGrossCents(net, vat))} brutto</span>
    </p>
  )
}

export function AddToCart({ id, className = '' }: { id: string; className?: string }) {
  const lines = useCart()
  const inCart = lines.some((l) => l.id === id)
  if (inCart) {
    return (
      <Link to="/koszyk" className={`btn btn-obrys ${className}`}>
        <CartIcon /> W koszyku
      </Link>
    )
  }
  return (
    <button type="button" onClick={() => cart.add(id)} className={`btn btn-glowny ${className}`}>
      Do koszyka
    </button>
  )
}

export function ProductTile({ product }: { product: CatalogProduct }) {
  return (
    <article className="panel flex h-full flex-col p-0">
      <Link to="/sklep/$slug" params={{ slug: product.slug }} className="group block" tabIndex={-1} aria-hidden="true">
        <div className="aspect-[4/3] overflow-hidden rounded-t-[var(--radius-panel)] border-b border-linia bg-mgla">
          {product.preview ? (
            <img
              src={product.preview}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover object-top transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <DocPlaceholder />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-tusz-2 uppercase">{docTypeLabel(product)}</p>
        <h3 className="mt-1 text-lg leading-snug">
          <Link to="/sklep/$slug" params={{ slug: product.slug }} className="hover:text-znak hover:underline">
            {product.title}
          </Link>
        </h3>
        {product.short_description && <p className="mt-2 line-clamp-3 text-sm text-tusz-2">{product.short_description}</p>}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <Price net={product.price_net_cents} vat={product.vat_rate} />
          <AddToCart id={product.id} className="min-h-11 px-4" />
        </div>
      </div>
    </article>
  )
}

export function DocPlaceholder() {
  return (
    <div className="grid size-full place-items-center text-tusz-2/40">
      <svg viewBox="0 0 48 48" className="size-16" fill="none" aria-hidden="true">
        <path d="M12 4h17l9 9v31H12z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M29 4v9h9M18 24h14M18 31h14M18 38h9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function CartIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="19.5" r="1.4" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

// Ikona koszyka w naglowku z liczba pozycji.
export function CartButton({ className = '' }: { className?: string }) {
  const count = useCart().length
  return (
    <Link
      to="/koszyk"
      className={`relative grid size-11 place-items-center rounded-full bg-znak-jasny text-znak-ciemny hover:bg-znak hover:text-papier ${className}`}
      aria-label={count ? `Koszyk, pozycji: ${count}` : 'Koszyk, pusty'}
    >
      <CartIcon />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-tasma px-1 text-xs font-bold text-tusz">
          {count}
        </span>
      )}
    </Link>
  )
}

export function ShopSoon() {
  return (
    <div className="panel">
      <p className="font-semibold">Sklep z dokumentami będzie dostępny wkrótce.</p>
      <p className="mt-2">
        Potrzebujesz dokumentacji już teraz? Napisz do nas przez{' '}
        <Link to="/kontakt" hash="konsultacja" className="link">formularz kontaktowy</Link>.
      </p>
    </div>
  )
}

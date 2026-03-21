'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@bedo-fish/types'

type FishSize = 'Small' | 'Medium' | 'Large'

const SIZES: { label: FishSize; price: number; sizeVariant: string; slug: string }[] = [
  { label: 'Small',  price: 350, sizeVariant: 'Small',  slug: 'whole-roasted-tilapia-small' },
  { label: 'Medium', price: 550, sizeVariant: 'Medium', slug: 'whole-roasted-tilapia-medium' },
  { label: 'Large',  price: 750, sizeVariant: 'Large',  slug: 'whole-roasted-tilapia-large' },
]

function makeProduct(size: FishSize, price: number, sizeVariant: string, slug: string): Product {
  return {
    id: `hero-tilapia-${size.toLowerCase()}`,
    name: 'Whole Roasted Tilapia',
    slug,
    sizeVariant,
    description: null,
    priceKes: price.toFixed(2),
    originalPrice: null,
    stockQty: 99,
    sku: null,
    badge: null,
    imageUrl: null,
    imageUrls: null,
    isActive: true,
    isFeatured: true,
    weightGrams: null,
    sortOrder: 0,
    categoryId: null,
    metaTitle: null,
    metaDesc: null,
    createdAt: '',
    updatedAt: '',
  }
}

export function HeroCtaCard() {
  const [selectedSize, setSelectedSize] = useState<FishSize>('Medium')
  const [qty, setQty] = useState(1)
  const addItem = useCartStore((s) => s.addItem)

  const current = SIZES.find((s) => s.label === selectedSize) ?? SIZES[1]

  const handleAddToCart = () => {
    addItem(makeProduct(current.label, current.price, current.sizeVariant, current.slug), qty)
  }

  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[860px] mb-8 hidden md:flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/10 z-30"
      style={{
        background: 'rgba(10, 12, 20, 0.72)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      {/* Fish thumbnail */}
      <div
        className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{ background: 'rgba(244,145,30,0.15)', border: '1px solid rgba(244,145,30,0.2)' }}
      >
        <svg width="40" height="26" viewBox="0 0 60 36" fill="none" aria-hidden="true">
          <path
            d="M8 18C14 6 28 2 44 8C52 11 57 14 58 18C57 22 52 25 44 28C28 34 14 30 8 18Z"
            fill="rgba(244,145,30,0.25)"
            stroke="rgba(244,145,30,0.7)"
            strokeWidth="1.5"
          />
          <circle cx="50" cy="14" r="3.5" fill="rgba(244,145,30,0.8)" />
          <circle cx="51" cy="14.5" r="1.3" fill="#06101F" />
          <path d="M8 18L1 10V26Z" fill="rgba(244,145,30,0.3)" />
        </svg>
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-[14px] font-semibold font-body truncate">
          Whole Roasted Tilapia
        </p>
        <div className="flex items-center gap-2 mt-1">
          {SIZES.map((s) => (
            <button
              key={s.label}
              onClick={() => setSelectedSize(s.label)}
              className={`text-[11px] font-medium font-body transition-colors duration-150 ${
                selectedSize === s.label
                  ? 'text-orange font-semibold'
                  : 'text-white/45 hover:text-white/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price + details */}
      <div className="flex flex-col items-start flex-shrink-0">
        <span className="text-white text-[14px] font-semibold font-heading">
          KES {current.price.toLocaleString()}
        </span>
        <a
          href={`/products/${current.slug}`}
          className="text-white/50 text-[11px] font-body hover:text-white/80 transition-colors mt-0.5 underline underline-offset-2"
        >
          More Details
        </a>
      </div>

      {/* Divider */}
      <div className="w-px h-10 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Quantity controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white text-lg font-light transition-all duration-150"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="text-white text-[14px] font-semibold font-body w-4 text-center">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white text-lg font-light transition-all duration-150"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-10 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        className="flex-shrink-0 px-5 py-2.5 rounded-xl text-white text-[12px] font-semibold font-body tracking-widest uppercase transition-all duration-200 hover:brightness-110 active:scale-95"
        style={{ background: 'rgba(244,145,30,0.18)', border: '1px solid rgba(244,145,30,0.35)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(244,145,30,0.32)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(244,145,30,0.18)'
        }}
      >
        ADD TO CART
      </button>
    </div>
  )
}

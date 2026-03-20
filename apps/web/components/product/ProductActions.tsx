'use client'

import { useState } from 'react'
import type { Product } from '@bedo-fish/types'
import { useCartStore } from '@/store/cartStore'

export function ProductActions({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const addItem = useCartStore((s) => s.addItem)
  const outOfStock = product.stockQty === 0

  return (
    <div className="flex items-center gap-3 mt-2">
      {/* Qty selector */}
      <div className="flex items-center border-[1.5px] border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-2.5 text-navy hover:bg-gray-100 transition-colors font-body"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value))))}
          className="w-10 text-center font-body text-sm text-navy outline-none py-2.5 bg-white"
        />
        <button
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          className="px-3 py-2.5 text-navy hover:bg-gray-100 transition-colors font-body"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        onClick={() => !outOfStock && addItem(product, qty)}
        disabled={outOfStock}
        className="flex-1 bg-orange text-white font-body text-[15px] font-medium py-3.5 rounded-xl hover:bg-orange-dark transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}

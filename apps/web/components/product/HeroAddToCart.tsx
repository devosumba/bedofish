'use client'

import type { Product } from '@bedo-fish/types'
import { useCartStore } from '@/store/cartStore'

export function HeroAddToCart({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  return (
    <button
      onClick={() => addItem(product)}
      className="bg-orange text-white font-body text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-orange-dark transition-colors"
    >
      Add to Cart
    </button>
  )
}

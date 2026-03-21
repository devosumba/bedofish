'use client'

import Link from 'next/link'
import type { Product } from '@bedo-fish/types'
import { useCartStore } from '@/store/cartStore'
import { FishSvg } from './FishSvg'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  const bgColor = '#0D1F4E' // Navy as default card header bg

  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 cursor-pointer group transition-all duration-[220ms] hover:-translate-y-1 hover:border-orange hover:shadow-[0_8px_24px_rgba(244,145,30,0.12)] overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        {/* Color header */}
        <div
          className="h-28 relative flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <FishSvg width={64} height={42} />
          {product.badge && (
            <span className="absolute top-2.5 right-2.5 bg-white/18 border border-white/25 text-white font-body text-[9px] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full">
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <p className="text-navy text-sm font-semibold font-body mb-0.5 group-hover:text-orange transition-colors">
            {product.name}
          </p>
          <p className="text-orange text-[10px] font-semibold font-body uppercase tracking-[0.5px] mb-1.5">
            {product.sizeVariant}
          </p>
          {product.description && (
            <p className="text-gray-400 text-xs font-body leading-5 line-clamp-2 mb-3.5">
              {product.description}
            </p>
          )}
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-orange font-heading text-xl font-bold">
              KES {parseFloat(product.priceKes).toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-gray-300 text-[11px] line-through ml-1.5 font-body">
                KES {parseFloat(product.originalPrice).toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              addItem(product)
            }}
            className="bg-navy text-white font-body text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-navy-mid transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

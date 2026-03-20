'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Product } from '@bedo-fish/types'
import { api } from '@/lib/api'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'

interface Props {
  initialProducts: Product[]
  initialCategory?: string
}

const TABS = [
  { label: 'All', value: '' },
  { label: 'Whole Fish', value: 'whole-fish' },
  { label: 'Packs', value: 'packs' },
  { label: 'Spices', value: 'spices' },
]

export function ProductGrid({ initialProducts, initialCategory }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') ?? initialCategory ?? ''
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading } = useQuery({
    queryKey: ['products', { category, search, page }],
    queryFn: () => api.products.list({ category: category || undefined, search: search || undefined, page }),
    initialData: { data: initialProducts, meta: { page: 1, total: initialProducts.length, pages: 1 } },
    staleTime: 300_000,
  })

  const products = data?.data ?? []

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('category', value)
    else params.delete('category')
    params.delete('page')
    router.replace(`/shop?${params.toString()}`, { scroll: false })
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mt-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategory(tab.value)}
            className={`font-body text-sm px-4 py-2 rounded-lg transition-all ${
              category === tab.value
                ? 'bg-navy text-white'
                : 'bg-white border-[1.5px] border-gray-200 text-navy hover:border-navy'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.length === 0
          ? (
            <div className="col-span-3 text-center py-16 text-gray-400 font-body">
              No products found.
            </div>
          )
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  )
}

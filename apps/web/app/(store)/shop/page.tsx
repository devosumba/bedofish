import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { Product } from '@bedo-fish/types'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Shop Fresh Roasted Tilapia, Family Packs and Export Packs',
}

interface SearchParams {
  category?: string
  search?: string
  page?: string
}

async function getProducts(params: SearchParams): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1'
  const qs = new URLSearchParams()
  if (params.category) qs.set('category', params.category)
  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', params.page)

  try {
    const res = await fetch(`${baseUrl}/products?${qs.toString()}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const json = await res.json() as { success: boolean; data: Product[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const initialProducts = await getProducts(params)

  return (
    <>
      <div className="bg-gray-100 min-h-screen py-16 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div>
            <span className="inline-flex bg-orange text-white font-body text-[10px] font-semibold uppercase tracking-[1.5px] px-3 py-1.5 rounded-full">
              Fresh Daily
            </span>
            <h1 className="font-heading font-bold text-[40px] text-navy mt-3 mb-2.5">Our Products</h1>
            <p className="text-gray-600 font-body text-[15px] max-w-lg leading-[1.75]">
              Sustainably sourced from Lake Victoria. Roasted fresh daily using energy-efficient ovens.
              Packaged to international standards.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ProductGrid
              initialProducts={initialProducts}
              initialCategory={params.category}
            />
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Product } from '@bedo-fish/types'
import { ProductActions } from '@/components/product/ProductActions'
import { FishSvg } from '@/components/product/FishSvg'
import { Footer } from '@/components/layout/Footer'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1'

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${BASE_URL}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 600 },
    })
    if (res.status === 404) return null
    if (!res.ok) return null
    const json = await res.json() as { success: boolean; data: Product }
    return json.data
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${BASE_URL}/products?limit=20`)
    if (!res.ok) return []
    const json = await res.json() as { data: Product[] }
    return (json.data ?? []).map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDesc ?? product.description ?? undefined,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <>
      <div className="bg-gray-100 min-h-screen py-12 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: image */}
            <div className="aspect-square rounded-2xl overflow-hidden relative bg-navy flex items-center justify-center">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <FishSvg width={140} height={92} />
              )}
            </div>

            {/* Right: details */}
            <div>
              <span className="inline-block bg-gray-100 text-gray-600 font-body text-[11px] px-2.5 py-1 rounded-lg mb-2">
                Lake Victoria Tilapia
              </span>
              <h1 className="font-heading font-bold text-[36px] text-navy mt-2 mb-1">{product.name}</h1>
              <p className="text-orange font-body text-[13px] font-semibold uppercase tracking-[0.5px] mb-4">
                {product.sizeVariant}
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-orange font-heading text-[40px] font-bold">
                  KES {parseFloat(product.priceKes).toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-gray-300 text-base line-through font-body">
                    KES {parseFloat(product.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-gray-600 font-body text-[15px] leading-7 mb-6">
                  {product.description}
                </p>
              )}

              <ProductActions product={product} />

              {/* Features */}
              <div className="mt-6 border-t border-gray-200 pt-6 space-y-2">
                {[
                  'Freshly Roasted',
                  'Lake Victoria Tilapia',
                  'Export-Grade Packaging',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="8" fill="#EAF7EF" />
                      <path d="M5 8l2 2 4-4" stroke="#1B7A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-gray-600 font-body text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'

export default function ShopLoading() {
  return (
    <div className="bg-gray-100 min-h-screen py-16 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mb-3" />
        <div className="h-10 bg-gray-200 rounded animate-pulse w-48 mb-2.5" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-96 mb-1" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-72 mt-8 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

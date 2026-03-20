export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
      <div className="h-28 bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-16" />
        </div>
      </div>
    </div>
  )
}

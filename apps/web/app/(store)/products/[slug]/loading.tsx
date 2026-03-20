export default function ProductLoading() {
  return (
    <div className="bg-gray-100 min-h-screen py-12 px-6 lg:px-16">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
        <div className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
        <div className="space-y-4 pt-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-10 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-12 bg-gray-200 rounded animate-pulse w-40" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
          </div>
          <div className="h-14 bg-gray-200 rounded-xl animate-pulse w-full mt-4" />
        </div>
      </div>
    </div>
  )
}

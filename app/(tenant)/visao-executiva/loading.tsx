export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-5 bg-slate-200 rounded-full" />
              <div className="w-40 h-4 bg-slate-200 rounded-full" />
            </div>
            <div className="w-80 h-8 bg-slate-300 rounded-lg" />
            <div className="w-64 h-4 bg-slate-200 rounded-md" />
          </div>
          <div className="flex gap-3">
            <div className="w-24 h-9 bg-slate-200 rounded-md" />
            <div className="w-40 h-9 bg-slate-300 rounded-md" />
          </div>
        </div>

        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl p-4 bg-white border border-slate-100 shadow-sm h-[116px]">
              <div className="flex justify-between mb-3">
                <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                <div className="w-4 h-4 bg-slate-100 rounded-full" />
              </div>
              <div className="w-24 h-6 bg-slate-200 rounded-md mb-2" />
              <div className="w-32 h-3 bg-slate-100 rounded-sm" />
            </div>
          ))}
        </div>

        {/* Body Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex justify-between">
              <div className="w-48 h-5 bg-slate-200 rounded-md" />
              <div className="w-24 h-4 bg-slate-200 rounded-md" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl bg-white border border-slate-100 shadow-sm h-48" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm h-64" />
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm h-48" />
          </div>
        </div>
        
      </div>
    </div>
  )
}

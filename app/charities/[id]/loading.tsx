export default function CharityLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header Skeleton */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Image Skeleton */}
        <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-gray-200 dark:bg-slate-700 animate-pulse"></div>

        {/* Content Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-slate-700 shadow-2xl">
          {/* Title Skeleton */}
          <div className="mb-6">
            <div className="h-10 w-3/4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
            <div className="h-6 w-32 bg-emerald-200 dark:bg-emerald-900/30 rounded-full animate-pulse"></div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>

          {/* Events Skeleton */}
          <div className="mb-8">
            <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 w-full bg-gray-100 dark:bg-slate-900 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-gray-100 dark:bg-slate-900 rounded animate-pulse"></div>
            </div>
          </div>

          {/* CTA Skeleton */}
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-500/30">
            <div className="h-6 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
            <div className="h-12 w-40 bg-emerald-300 dark:bg-emerald-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

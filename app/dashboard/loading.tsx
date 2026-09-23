export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Navigation Skeleton */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="flex items-center gap-4">
              <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-96 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              </div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Score Management Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 w-full bg-gray-100 dark:bg-slate-900 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Winnings Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-6"></div>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

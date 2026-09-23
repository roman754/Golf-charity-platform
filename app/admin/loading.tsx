import AdminNav from '@/components/AdminNav';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-80 mb-8 animate-pulse"></div>

        {/* Stats Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
            >
              <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
            >
              <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded mb-3 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Tables Skeleton */}
        <div className="grid lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
            >
              <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-6 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4"
                  >
                    <div className="h-5 bg-gray-200 dark:bg-slate-600 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-1/2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

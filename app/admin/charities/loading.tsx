import AdminNav from '@/components/AdminNav';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-96 animate-pulse"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
            >
              <div className="h-16 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

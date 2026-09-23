import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Heart, ExternalLink } from 'lucide-react';
import AdminNav from '@/components/AdminNav';

export default async function ManageCharitiesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all charities
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Charities
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all registered charities
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities && charities.length > 0 ? (
            charities.map((charity) => (
              <div
                key={charity.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
              >
                {charity.logo_url && (
                  <div className="mb-4">
                    <img
                      src={charity.logo_url}
                      alt={charity.name}
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                )}
                
                <div className="flex items-start gap-2 mb-3">
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {charity.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {charity.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {charity.registration_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Registration:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {charity.registration_number}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      charity.is_active
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {charity.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {charity.website_url && (
                    <a
                      href={charity.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mt-3"
                    >
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No charities registered yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

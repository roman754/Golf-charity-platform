import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Heart, ExternalLink, Calendar, ArrowLeft } from 'lucide-react';
import CharityActionButton from '@/components/CharityActionButton';

export default async function CharityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // Parallel data fetching for better performance
  const [charityResult, contributionsResult] = await Promise.all([
    supabase
      .from('charities')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('charity_contributions')
      .select('amount')
      .eq('charity_id', id)
  ]);

  const charity = charityResult.data;
  const contributions = contributionsResult.data;

  if (!charity) {
    notFound();
  }

  const totalContributions = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/charities" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to charities
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Image */}
        {charity.image_url && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <img
              src={charity.image_url}
              alt={charity.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-slate-700 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{charity.name}</h1>
              {charity.is_featured && (
                <span className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured Partner
                </span>
              )}
            </div>
            <Heart className="w-12 h-12 text-pink-600 dark:text-pink-400" />
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 leading-relaxed">
            {charity.description}
          </p>

          {/* Stats */}
          {totalContributions > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 mb-8 border border-emerald-200 dark:border-emerald-500/30">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Community Impact</h3>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${totalContributions.toFixed(2)}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total contributions from our community</p>
            </div>
          )}

          {/* Upcoming Events */}
          {charity.upcoming_events && charity.upcoming_events.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-emerald-600 dark:text-emerald-400" />
                Upcoming Events
              </h3>
              <ul className="space-y-3">
                {charity.upcoming_events.map((event, index) => (
                  <li
                    key={index}
                    className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700"
                  >
                    {event}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Website Link */}
          {charity.website_url && (
            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <a
                href={charity.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold"
              >
                Visit Official Website
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-500/30">
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">
              Support {charity.name}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
              {user 
                ? 'Select this charity to direct part of your subscription fee to their cause.'
                : 'Subscribe to our platform and select this charity to direct part of your subscription fee to their cause.'
              }
            </p>
            <CharityActionButton 
              charityId={charity.id} 
              charityName={charity.name}
              isLoggedIn={!!user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

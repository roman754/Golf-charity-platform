import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, 
  TrendingUp, 
  Heart, 
  CreditCard, 
  Calendar,
  LogOut,
  User
} from 'lucide-react';
import ScoreManager from '@/components/ScoreManager';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import RefreshButton from '@/components/RefreshButton';
import SignOutButton from '@/components/SignOutButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const [profileResult, subscriptionResult, scoresResult, entriesResult, winningsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select(`
        *,
        charity:charities(*)
      `)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .limit(5),
    supabase
      .from('draw_entries')
      .select(`
        *,
        draw:draws(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('winners')
      .select(`
        *,
        draw:draws(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false})
  ]);

  const profile = profileResult.data;
  
  if (profile?.role === 'admin') {
    redirect('/admin');
  }

  const subscription = subscriptionResult.data;
  const scores = scoresResult.data;
  const entries = entriesResult.data;
  const winnings = winningsResult.data;

  // Get charity preference from user metadata if no subscription exists
  let selectedCharity = subscription?.charity;
  let charityPercentage = subscription?.charity_percentage || 10;

  if (!subscription && user.user_metadata?.charity_id) {
    // Fetch the charity from metadata
    const { data: metadataCharity } = await supabase
      .from('charities')
      .select('*')
      .eq('id', user.user_metadata.charity_id)
      .single();
    
    if (metadataCharity) {
      selectedCharity = metadataCharity;
      charityPercentage = user.user_metadata.charity_percentage || 10;
    }
  }

  const totalWinnings = winnings?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0;
  const pendingWinnings = winnings?.filter(w => w.payment_status === 'pending').length || 0;

  const isActive = subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              Golf Charity
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/charities" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                Charities
              </Link>
              {profile?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold"
                >
                  Admin
                </Link>
              )}
              <RefreshButton />
              <SignOutButton showIcon={true} />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your scores, track your participation, and view your winnings
          </p>
        </div>

        {/* Subscription Status Banner */}
        {!isActive && (
          <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-500/50 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                  Subscription Inactive
                </h3>
                <p className="text-yellow-700 dark:text-yellow-200 mb-4">
                  Subscribe now to enter monthly draws and support your chosen charity
                </p>
                {!selectedCharity && (
                  <p className="text-yellow-700 dark:text-yellow-200 text-sm mb-4">
                    ⚠️ Please select a charity before subscribing
                  </p>
                )}
                <div className="flex gap-4">
                  <Link
                    href="/subscribe"
                    className={`inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg ${!selectedCharity ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Subscribe Now
                  </Link>
                  {!selectedCharity && (
                    <Link
                      href="/select-charity"
                      className="inline-block px-6 py-3 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg border-2 border-emerald-600 dark:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700"
                    >
                      Choose Charity
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Subscription Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isActive 
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Subscription</p>
            <p className="text-gray-900 dark:text-white font-semibold text-lg capitalize">
              {subscription?.plan_type || 'None'}
            </p>
            {subscription?.current_period_end && (
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                Renews: {formatShortDate(subscription.current_period_end)}
              </p>
            )}
          </div>

          {/* Charity Support */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              {selectedCharity && (
                <Link 
                  href="/select-charity"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Change
                </Link>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Supporting</p>
            <p className="text-gray-900 dark:text-white font-semibold text-lg">
              {selectedCharity?.name || 'No charity selected'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {charityPercentage}% contribution
            </p>
          </div>

          {/* Draws Entered */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Draws Entered</p>
            <p className="text-gray-900 dark:text-white font-semibold text-3xl">{entries?.length || 0}</p>
          </div>

          {/* Total Winnings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              {pendingWinnings > 0 && (
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                  {pendingWinnings} pending
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Winnings</p>
            <p className="text-gray-900 dark:text-white font-semibold text-3xl">
              {formatCurrency(totalWinnings)}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Score Management */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Golf Scores</h2>
            </div>
            <ScoreManager initialScores={scores || []} />
            {!isActive && (
              <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Subscribe to enter draws with your scores
              </div>
            )}
          </div>

          {/* Recent Winnings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center mb-6">
              <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Winnings</h2>
            </div>
            
            {winnings && winnings.length > 0 ? (
              <div className="space-y-4">
                {winnings.map((win) => (
                  <div
                    key={win.id}
                    className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {formatCurrency(win.prize_amount)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {win.match_type.replace('-', ' ')} winner
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs">
                          Draw: {formatShortDate(win.draw?.draw_date || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          win.payment_status === 'paid'
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                            : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {win.payment_status}
                        </span>
                        {win.verification_status === 'pending' && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Verification pending
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {win.verification_status === 'pending' && !win.proof_image_url && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Upload proof of your golf scores to claim prize
                        </p>
                        <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-semibold">
                          Upload Proof →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No winnings yet</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Keep playing and good luck in upcoming draws!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Draws */}
        {entries && entries.length > 0 && (
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Draw Entries</h2>
            <div className="space-y-4">
              {entries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {formatShortDate(entry.draw?.draw_date || '')}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Your numbers: {entry.entry_numbers.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        entry.draw?.status === 'published'
                          ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                          : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                      }`}>
                        {entry.draw?.status}
                      </span>
                      {entry.matches_count > 0 && (
                        <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                          {entry.matches_count} matches!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

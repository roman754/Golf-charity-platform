import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  DollarSign,
  Trophy,
  Heart
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import AdminNav from '@/components/AdminNav';
import AdminCard from '@/components/AdminCard';

export default async function AdminDashboardPage() {
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

  // Fetch statistics
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: allSubscriptions } = await supabase
    .from('subscriptions')
    .select('plan_type, charity_percentage')
    .eq('status', 'active');

  // Calculate total revenue (simplified)
  const monthlyRevenue = (allSubscriptions?.filter(s => s.plan_type === 'monthly').length || 0) * 29.99;
  const yearlyRevenue = (allSubscriptions?.filter(s => s.plan_type === 'yearly').length || 0) * 299.99;
  const totalRevenue = monthlyRevenue + yearlyRevenue;

  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(5);

  const { data: winners } = await supabase
    .from('winners')
    .select('prize_amount')
    .eq('payment_status', 'paid');

  const totalPrizePaid = winners?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0;

  const { data: pendingWinners, count: pendingCount } = await supabase
    .from('winners')
    .select('*, user:profiles(*), draw:draws(*)')
    .eq('verification_status', 'pending')
    .limit(5);

  const { count: charitiesCount } = await supabase
    .from('charities')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Navigation */}
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
            <p className="text-gray-900 dark:text-white font-semibold text-3xl">{totalUsers || 0}</p>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1">
              {activeSubscribers || 0} active subscribers
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Monthly Revenue</p>
            <p className="text-gray-900 dark:text-white font-semibold text-3xl">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Prizes Paid</p>
            <p className="text-gray-900 dark:text-white font-semibold text-3xl">
              {formatCurrency(totalPrizePaid)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Charities</p>
            <p className="text-gray-900 dark:text-white font-semibold text-3xl">{charitiesCount || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AdminCard
            href="/admin/users"
            icon="users"
            title="Manage Users"
            description="View and edit users"
            color="blue"
          />

          <AdminCard
            href="/admin/draws"
            icon="trending"
            title="Manage Draws"
            description="Create and execute draws"
            color="purple"
          />

          <AdminCard
            href="/admin/charities"
            icon="heart"
            title="Manage Charities"
            description="Add and edit charities"
            color="pink"
          />

          <AdminCard
            href="/admin/winners"
            icon="trophy"
            title="Verify Winners"
            description={`${pendingCount || 0} pending`}
            color="yellow"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Draws */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Draws</h2>
              <Link
                href="/admin/draws"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-semibold"
              >
                View all →
              </Link>
            </div>

            {draws && draws.length > 0 ? (
              <div className="space-y-3">
                {draws.map((draw) => (
                  <div
                    key={draw.id}
                    className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {new Date(draw.draw_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {draw.total_participants} participants
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        draw.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : draw.status === 'published'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {draw.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No draws yet</p>
            )}
          </div>

          {/* Pending Winners */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Verifications</h2>
              <Link
                href="/admin/winners"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-semibold"
              >
                View all →
              </Link>
            </div>

            {pendingWinners && pendingWinners.length > 0 ? (
              <div className="space-y-3">
                {pendingWinners.map((winner) => (
                  <div
                    key={winner.id}
                    className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {winner.user?.full_name || winner.user?.email}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {winner.match_type} - {formatCurrency(winner.prize_amount)}
                        </p>
                      </div>
                      <Link
                        href={`/admin/winners`}
                        className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs hover:bg-yellow-200 dark:hover:bg-yellow-900/40 font-medium"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending verifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

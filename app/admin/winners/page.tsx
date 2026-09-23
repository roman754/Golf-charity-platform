'use client';

import { useEffect, useState } from 'react';
import { Check, X, DollarSign } from 'lucide-react';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import AdminNav from '@/components/AdminNav';

interface Winner {
  id: string;
  match_type: string;
  prize_amount: number;
  verification_status: string;
  payment_status: string;
  proof_image_url: string | null;
  admin_notes: string | null;
  user: { full_name: string; email: string };
  draw: { draw_date: string };
}

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data } = await supabase
        .from('winners')
        .select(`
          *,
          user:profiles(*),
          draw:draws(*)
        `)
        .order('created_at', { ascending: false });
      
      setWinners(data || []);
    } catch (error) {
      console.error('Error loading winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (winnerId: string, status: 'verified' | 'rejected', notes?: string) => {
    setProcessing(winnerId);

    try {
      const response = await fetch(`/api/admin/winners/${winnerId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes }),
      });

      if (response.ok) {
        await loadWinners();
      } else {
        alert('Failed to update verification status');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkPaid = async (winnerId: string) => {
    if (!confirm('Mark this winner as paid?')) return;

    setProcessing(winnerId);

    try {
      const response = await fetch(`/api/admin/winners/${winnerId}/mark-paid`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadWinners();
      } else {
        alert('Failed to update payment status');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setProcessing(null);
    }
  };

  const filteredWinners = winners.filter(w => {
    if (filter === 'pending') return w.verification_status === 'pending';
    if (filter === 'verified') return w.verification_status === 'verified';
    if (filter === 'unpaid') return w.payment_status === 'pending' && w.verification_status === 'verified';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Manage Winners</h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'verified', 'unpaid'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Winners List */}
        <div className="space-y-4">
          {filteredWinners.map((winner) => (
            <div
              key={winner.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {winner.user.full_name || winner.user.email}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      Prize: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(winner.prize_amount)}</span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Match Type: <span className="text-gray-900 dark:text-white">{winner.match_type}</span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Draw Date: <span className="text-white">{formatShortDate(winner.draw.draw_date)}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      winner.verification_status === 'verified'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : winner.verification_status === 'rejected'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {winner.verification_status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      winner.payment_status === 'paid'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      Payment: {winner.payment_status}
                    </span>
                  </div>
                </div>

                <div>
                  {winner.proof_image_url && (
                    <div className="mb-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Proof Submission:</p>
                      <img
                        src={winner.proof_image_url}
                        alt="Proof"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                      />
                    </div>
                  )}

                  {winner.verification_status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(winner.id, 'verified')}
                        disabled={processing === winner.id}
                        className="flex items-center px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify(winner.id, 'rejected', 'Proof insufficient')}
                        disabled={processing === winner.id}
                        className="flex items-center px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  )}

                  {winner.verification_status === 'verified' && winner.payment_status === 'pending' && (
                    <button
                      onClick={() => handleMarkPaid(winner.id)}
                      disabled={processing === winner.id}
                      className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredWinners.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <p className="text-gray-500 dark:text-gray-400">No winners found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

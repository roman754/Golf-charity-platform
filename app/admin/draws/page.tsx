'use client';

import { useEffect, useState } from 'react';
import { Plus, Play, Eye, Loader2 } from 'lucide-react';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import AdminNav from '@/components/AdminNav';

interface Draw {
  id: string;
  draw_date: string;
  status: string;
  draw_type: string;
  total_participants: number;
  total_pool_amount: number;
  jackpot_amount: number;
  winning_numbers: number[];
}

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    draw_date: '',
    draw_type: 'random',
  });
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadDraws();
  }, []);

  const loadDraws = async () => {
    try {
      const response = await fetch('/api/admin/draws');
      const data = await response.json();
      setDraws(data.draws || []);
    } catch (error) {
      console.error('Error loading draws:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing('create');

    try {
      const response = await fetch('/api/admin/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadDraws();
        setShowCreateForm(false);
        setFormData({ draw_date: '', draw_type: 'random' });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create draw');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setProcessing(null);
    }
  };

  const handleExecuteDraw = async (drawId: string) => {
    if (!confirm('Execute this draw? This will generate entries and calculate winners.')) {
      return;
    }

    setProcessing(drawId);

    try {
      const response = await fetch(`/api/admin/draws/${drawId}/execute`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Draw executed! ${data.entriesCount} entries created, ${data.result.winners.length} winners`);
        await loadDraws();
      } else {
        alert(data.error || 'Failed to execute draw');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setProcessing(null);
    }
  };

  const handlePublishDraw = async (drawId: string) => {
    if (!confirm('Publish this draw? Results will be visible to users.')) {
      return;
    }

    setProcessing(drawId);

    try {
      const response = await fetch(`/api/admin/draws/${drawId}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Draw published successfully!');
        await loadDraws();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to publish draw');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Manage Draws</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Draw
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Draw</h3>
            <form onSubmit={handleCreateDraw} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Draw Date</label>
                  <input
                    type="date"
                    value={formData.draw_date}
                    onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Draw Type</label>
                  <select
                    value={formData.draw_type}
                    onChange={(e) => setFormData({ ...formData, draw_type: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white"
                  >
                    <option value="random">Random</option>
                    <option value="algorithmic">Algorithmic (Weighted)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={processing === 'create'}
                  className="px-6 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50"
                >
                  {processing === 'create' ? 'Creating...' : 'Create Draw'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Draws List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
          </div>
        ) : draws.length > 0 ? (
          <div className="space-y-4">
            {draws.map((draw) => (
              <div
                key={draw.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {formatShortDate(draw.draw_date)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {draw.draw_type} draw • {draw.total_participants} participants
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    draw.status === 'completed'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : draw.status === 'published'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {draw.status}
                  </span>
                </div>

                {draw.winning_numbers && draw.winning_numbers.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Winning Numbers:</p>
                    <div className="flex gap-2">
                      {draw.winning_numbers.map((num, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {draw.total_pool_amount > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Prize Pool</p>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {formatCurrency(draw.total_pool_amount)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Jackpot</p>
                      <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                        {formatCurrency(draw.jackpot_amount)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {draw.status === 'pending' && (
                    <button
                      onClick={() => handleExecuteDraw(draw.id)}
                      disabled={processing === draw.id}
                      className="flex items-center px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {processing === draw.id ? 'Executing...' : 'Execute Draw'}
                    </button>
                  )}
                  {draw.status === 'pending' && draw.winning_numbers.length > 0 && (
                    <button
                      onClick={() => handlePublishDraw(draw.id)}
                      disabled={processing === draw.id}
                      className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {processing === draw.id ? 'Publishing...' : 'Publish Results'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No draws created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

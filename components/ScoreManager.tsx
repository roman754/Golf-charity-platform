'use client';

import { useState } from 'react';
import { GolfScore } from '@/types/database';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { formatShortDate } from '@/lib/utils';

export default function ScoreManager({ initialScores }: { initialScores: GolfScore[] }) {
  const [scores, setScores] = useState<GolfScore[]>(initialScores);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ score: '', score_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ score: '', score_date: new Date().toISOString().split('T')[0] });
    setError('');
  };

  const handleEdit = (score: GolfScore) => {
    setEditingId(score.id);
    setFormData({
      score: score.score.toString(),
      score_date: score.score_date,
    });
    setError('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ score: '', score_date: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const scoreNum = parseInt(formData.score);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45');
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        // Update existing score
        const response = await fetch(`/api/scores/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: scoreNum,
            score_date: formData.score_date,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'Failed to update score');
          setLoading(false);
          return;
        }

        setScores(scores.map(s => s.id === editingId ? data.score : s));
      } else {
        // Add new score
        const response = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: scoreNum,
            score_date: formData.score_date,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'Failed to add score');
          setLoading(false);
          return;
        }

        setScores([data.score, ...scores].slice(0, 5));
      }

      handleCancel();
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this score?')) return;

    try {
      const response = await fetch(`/api/scores/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setScores(scores.filter(s => s.id !== id));
      } else {
        alert('Failed to delete score');
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  return (
    <div>
      {/* Score Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded p-2 text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">
                Score (1-45)
              </label>
              <input
                type="number"
                min="1"
                max="45"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="36"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.score_date}
                onChange={(e) => setFormData({ ...formData, score_date: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Check className="w-4 h-4 mr-1" />
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add Score'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Add Button */}
      {!isAdding && !editingId && scores.length < 5 && (
        <button
          onClick={handleAdd}
          className="mb-6 w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Score
        </button>
      )}

      {/* Scores List */}
      {scores.length > 0 ? (
        <div className="space-y-3">
          {scores.map((score) => (
            <div
              key={score.id}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-semibold text-2xl">{score.score}</p>
                <p className="text-slate-400 text-sm">{formatShortDate(score.score_date)}</p>
              </div>
              {editingId !== score.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(score)}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(score.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {scores.length === 5 && !isAdding && !editingId && (
            <p className="text-slate-400 text-sm text-center">
              Maximum 5 scores. Delete an old score to add a new one.
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400">No scores yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Add your last 5 golf scores to participate in draws
          </p>
        </div>
      )}
    </div>
  );
}

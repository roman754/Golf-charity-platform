'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
}

export default function SelectCharityPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load charities
    const { data: charitiesData } = await supabase
      .from('charities')
      .select('*')
      .order('name');

    if (charitiesData) {
      setCharities(charitiesData);
    }

    // Load user's current selection
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.charity_id) {
      setSelectedCharityId(user.user_metadata.charity_id);
      setPercentage(user.user_metadata.charity_percentage || 10);
    } else if (charitiesData && charitiesData.length > 0) {
      setSelectedCharityId(charitiesData[0].id);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          charity_id: selectedCharityId,
          charity_percentage: percentage,
        }
      });

      if (error) {
        alert('Failed to save charity selection');
        console.error(error);
      } else {
        // If user has a subscription, update it
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('subscriptions')
            .update({
              charity_id: selectedCharityId,
              charity_percentage: percentage,
            })
            .eq('user_id', user.id);
        }

        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Something went wrong');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-200 dark:border-slate-700">
          <div className="flex items-center mb-6">
            <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Select Your Charity
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Choose the charity you'd like to support with your subscription. A percentage of your subscription will go directly to your selected charity.
          </p>

          <div className="space-y-6">
            {/* Charity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Charity
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {charities.map((charity) => (
                  <motion.div
                    key={charity.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCharityId === charity.id
                        ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-emerald-400'
                    }`}
                    onClick={() => setSelectedCharityId(charity.id)}
                  >
                    <div className="flex items-start">
                      {charity.image_url && (
                        <img
                          src={charity.image_url}
                          alt={charity.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {charity.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {charity.description}
                        </p>
                      </div>
                      {selectedCharityId === charity.id && (
                        <div className="ml-2">
                          <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Percentage Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Charity Contribution: {percentage}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Minimum 10% of your subscription goes to your chosen charity
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || !selectedCharityId}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </span>
              ) : (
                'Save Selection'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

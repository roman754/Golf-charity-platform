'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled');

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    setLoading(planType);

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setLoading(null);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-300">
            Join our community and make a difference
          </p>
          {canceled && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-yellow-200 inline-block">
              Payment was canceled. Feel free to try again.
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-purple-500/50 transition-all"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-slate-300">.99/mo</span>
              </div>
              <p className="text-slate-300">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>Enter golf scores and participate in monthly draws</span>
              </li>
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>Win prizes in 3, 4, and 5-number matches</span>
              </li>
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>Support your chosen charity (minimum 10%)</span>
              </li>
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>Access to full dashboard and statistics</span>
              </li>
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>Cancel anytime</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading !== null}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {loading === 'monthly' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Subscribe Monthly'
              )}
            </button>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500 relative"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                BEST VALUE
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Yearly</h3>
              <div className="mb-2">
                <span className="text-5xl font-bold text-white">$299</span>
                <span className="text-slate-300">.99/yr</span>
              </div>
              <p className="text-green-400 font-semibold">Save $60 per year!</p>
              <p className="text-slate-300 text-sm mt-1">Equivalent to $25/month</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>Everything in Monthly plan</span>
              </li>
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>16% discount - save $60 annually</span>
              </li>
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>Exclusive yearly member benefits</span>
              </li>
              <li className="flex items-start text-slate-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span>Bigger impact on your chosen charity</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading !== null}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {loading === 'yearly' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Subscribe Yearly'
              )}
            </button>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm mb-4">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-slate-300 text-sm"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

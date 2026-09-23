'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

function SubscriptionSuccessContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifySubscription();
    } else {
      router.push('/dashboard');
    }
  }, [sessionId, router]);

  const verifySubscription = async () => {
    try {
      // Call verification endpoint to activate subscription
      const response = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Wait a moment to show success message
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } else {
        setError(data.error || 'Failed to verify subscription');
        setLoading(false);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Something went wrong. Please contact support.');
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    // Force refresh by adding timestamp to URL
    router.push(`/dashboard?refresh=${Date.now()}`);
    router.refresh(); // Force Next.js to refetch data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Activating your subscription...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
        >
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-slate-300 mb-8">{error}</p>
          <button
            onClick={goToDashboard}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6"
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome Aboard!
        </h1>
        
        <p className="text-slate-300 mb-8">
          Your subscription is now active. You can start entering your golf scores and participating in monthly draws.
        </p>

        <div className="space-y-4">
          <button
            onClick={goToDashboard}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-6 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}

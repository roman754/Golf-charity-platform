'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface CharityActionButtonProps {
  charityId: string;
  charityName: string;
  isLoggedIn: boolean;
}

export default function CharityActionButton({ charityId, charityName, isLoggedIn }: CharityActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSelectCharity = async () => {
    setLoading(true);

    // Show instant feedback
    const successToast = () => {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
      toast.textContent = `✓ ${charityName} selected!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    };

    try {
      // Update user metadata with charity selection
      const { error } = await supabase.auth.updateUser({
        data: {
          charity_id: charityId,
          charity_percentage: 10,
        }
      });

      if (error) {
        alert('Failed to select charity');
        console.error(error);
        setLoading(false);
      } else {
        // Show success message
        successToast();
        
        // Also update subscription if exists
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('subscriptions')
            .update({
              charity_id: charityId,
              charity_percentage: 10,
            })
            .eq('user_id', user.id);
        }

        // Small delay for toast to show, then redirect
        setTimeout(() => router.push('/dashboard'), 800);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <a
        href="/signup"
        className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
      >
        Get Started
      </a>
    );
  }

  return (
    <button
      onClick={handleSelectCharity}
      disabled={loading}
      className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Selecting...
        </span>
      ) : (
        'Select This Charity'
      )}
    </button>
  );
}

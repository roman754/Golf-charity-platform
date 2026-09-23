'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import NProgress from 'nprogress';

interface SignOutButtonProps {
  showIcon?: boolean;
  className?: string;
}

export default function SignOutButton({ showIcon = false, className = '' }: SignOutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    NProgress.start();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleSignOut}
      className={className || 'flex items-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium cursor-pointer'}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-1" />}
      Sign Out
    </button>
  );
}

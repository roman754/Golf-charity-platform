'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';
import SignOutButton from './SignOutButton';
import NProgress from 'nprogress';

export default function AdminNav() {
  const router = useRouter();

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    NProgress.start();
    router.push(href);
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              onClick={(e) => handleNavigation(e, '/')}
              className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <Trophy className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <span>Golf<span className="text-emerald-600 dark:text-emerald-400">Charity</span></span>
            </Link>
            <Link 
              href="/dashboard" 
              onClick={(e) => handleNavigation(e, '/dashboard')}
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              My Dashboard
            </Link>
          </div>
          <SignOutButton 
            showIcon={true} 
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium" 
          />
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { Users, TrendingUp, Heart, Trophy } from 'lucide-react';
import NProgress from 'nprogress';

interface AdminCardProps {
  href: string;
  icon: 'users' | 'trending' | 'heart' | 'trophy';
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'pink' | 'yellow' | 'emerald';
}

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
  pink: 'bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
};

const icons = {
  users: Users,
  trending: TrendingUp,
  heart: Heart,
  trophy: Trophy,
};

export default function AdminCard({ href, icon, title, description, color }: AdminCardProps) {
  const router = useRouter();
  const Icon = icons[icon];

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    NProgress.start();
    router.push(href);
  };

  return (
    <div
      onClick={handleClick}
      className={`${colorClasses[color]} rounded-xl p-6 border transition-all cursor-pointer transform hover:scale-105 duration-200`}
    >
      <Icon className="w-8 h-8 mb-3" />
      <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-1">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}

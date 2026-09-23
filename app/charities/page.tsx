'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Charity } from '@/types/database';
import NProgress from 'nprogress';

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [filteredCharities, setFilteredCharities] = useState<Charity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharities();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = charities.filter(
        charity =>
          charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          charity.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCharities(filtered);
    } else {
      setFilteredCharities(charities);
    }
  }, [searchQuery, charities]);

  const loadCharities = async () => {
    try {
      const response = await fetch('/api/charities');
      const data = await response.json();
      setCharities(data.charities || []);
      setFilteredCharities(data.charities || []);
    } catch (error) {
      console.error('Error loading charities:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredCharities = filteredCharities.filter(c => c.is_featured);
  const otherCharities = filteredCharities.filter(c => !c.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm">
            ← Back to home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Heart className="w-16 h-16 text-pink-600 dark:text-pink-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our Charity Partners
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Every subscription supports these amazing organizations making a real difference
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search charities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
          </div>
        ) : (
          <>
            {/* Featured Charities */}
            {featuredCharities.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 rounded-full text-sm mr-3">
                    FEATURED
                  </span>
                  Featured Partners
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCharities.map((charity, index) => (
                    <CharityCard key={charity.id} charity={charity} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* All Charities */}
            {otherCharities.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">All Charities</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherCharities.map((charity, index) => (
                    <CharityCard 
                      key={charity.id} 
                      charity={charity} 
                      index={index + featuredCharities.length} 
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredCharities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No charities found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CharityCard({ charity, index }: { charity: Charity; index: number }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    NProgress.start();
    router.push(`/charities/${charity.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-300 group cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2"
      onClick={handleClick}
    >
      <div>
        {charity.image_url && (
          <div className="aspect-video overflow-hidden">
            <img
              src={charity.image_url}
              alt={charity.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {charity.name}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {charity.description}
          </p>
          
          {charity.upcoming_events && charity.upcoming_events.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm mb-2">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="font-semibold">Upcoming Events</span>
              </div>
              <ul className="space-y-1">
                {charity.upcoming_events.slice(0, 2).map((event, i) => (
                  <li key={i} className="text-gray-600 dark:text-gray-400 text-xs">
                    • {event}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            {charity.website_url && (
              <a
                href={charity.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                Visit website
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Learn more →</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

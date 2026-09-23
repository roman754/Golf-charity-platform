'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Heart, Trophy, Users, ArrowRight, Check, TrendingUp, Award, Star, Moon, Sun } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import SignOutButton from '@/components/SignOutButton';

export default function HomePage() {
  const [stats, setStats] = useState({ users: 0, contributed: 0 });
  const [charities, setCharities] = useState<any[]>([]);
  const [animatedStats, setAnimatedStats] = useState({ users: 0, contributed: 0 });
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Fetch user profile to get role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setUserRole(profile?.role || null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (isStatsInView) {
      animateCounter(0, stats.users, 2000, (val) => 
        setAnimatedStats(prev => ({ ...prev, users: val }))
      );
      animateCounter(0, stats.contributed, 2000, (val) => 
        setAnimatedStats(prev => ({ ...prev, contributed: val }))
      );
    }
  }, [isStatsInView, stats]);

  const animateCounter = (start: number, end: number, duration: number, callback: (val: number) => void) => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(start + (end - start) * progress);
      callback(value);
      if (progress === 1) clearInterval(timer);
    }, 16);
  };

  const loadData = async () => {
    try {
      const response = await fetch('/api/charities?featured=true');
      const data = await response.json();
      setCharities(data.charities?.slice(0, 3) || []);
      
      setStats({ users: 100, contributed: 5000 });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const howItWorks = [
    {
      step: '01',
      title: 'Subscribe & Play',
      description: 'Join with a monthly or annual subscription and start tracking your golf scores.',
      icon: Users,
    },
    {
      step: '02',
      title: 'Track Your Game',
      description: 'Submit up to 5 golf scores per month. Each score is automatically entered into our monthly draw.',
      icon: TrendingUp,
    },
    {
      step: '03',
      title: 'Win & Give Back',
      description: 'Win prizes while 20% of all proceeds go directly to your chosen charity.',
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <span>Golf<span className="text-emerald-600 dark:text-emerald-400">Charity</span></span>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link 
                href="/charities" 
                className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
              >
                Charities
              </Link>
              
              {!loading && (
                user ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        NProgress.start();
                        // Redirect to admin dashboard if user is admin, otherwise user dashboard
                        const dashboardUrl = userRole === 'admin' ? '/admin' : '/dashboard';
                        router.push(dashboardUrl);
                      }}
                      className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium cursor-pointer bg-transparent border-none"
                    >
                      Dashboard
                    </button>
                    <SignOutButton />
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/signup" 
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/30"
                    >
                      Get Started
                    </Link>
                  </>
                )
              )}
              
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        {/* Subtle animated mesh gradient */}
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-semibold mb-6">
                <Star className="w-4 h-4" />
                Play Golf, Support Charities, Win Prizes
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Elevate Your Golf Game for a{' '}
                <motion.span 
                  className="relative inline-block"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6, #10b981)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Good Cause
                </motion.span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Track your scores, compete in monthly prize draws, and make a real difference. 20% of all proceeds support the charities you care about.
              </p>
              
              <div className="flex flex-wrap gap-4 items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => {
                      if (!loading) {
                        if (user) {
                          NProgress.start();
                          // Redirect to admin dashboard if user is admin, otherwise user dashboard
                          const dashboardUrl = userRole === 'admin' ? '/admin' : '/dashboard';
                          router.push(dashboardUrl);
                        } else {
                          router.push('/signup');
                        }
                      }
                    }}
                    className="relative inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg overflow-hidden group cursor-pointer"
                  >
                    {/* Animated gradient background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        backgroundSize: '200% 100%',
                      }}
                    />
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="relative z-10 text-white">
                      {user ? 'Go to Dashboard' : 'Start Playing Today'}
                    </span>
                  </button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/charities"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold rounded-lg border-2 border-gray-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-400 transition-all"
                  >
                    View Charities
                  </Link>
                </motion.div>
              </div>
              
              {/* Stats */}
              <motion.div 
                ref={statsRef} 
                className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-gray-200 dark:border-slate-700"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isStatsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1"
                    animate={isStatsInView ? {
                      textShadow: [
                        '0 0 20px rgba(16, 185, 129, 0.5)',
                        '0 0 40px rgba(16, 185, 129, 0.8)',
                        '0 0 20px rgba(16, 185, 129, 0.5)',
                      ],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {animatedStats.users}+
                  </motion.div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Active Players</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isStatsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.div 
                    className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1"
                    animate={isStatsInView ? {
                      textShadow: [
                        '0 0 20px rgba(16, 185, 129, 0.5)',
                        '0 0 40px rgba(16, 185, 129, 0.8)',
                        '0 0 20px rgba(16, 185, 129, 0.5)',
                      ],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  >
                    ${animatedStats.contributed.toLocaleString()}+
                  </motion.div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">For Charities</div>
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Professional stats grid */}
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$12,500</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Prize Pool</div>
                </motion.div>

                <motion.div
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">20%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Goes to Charity</div>
                </motion.div>

                <motion.div
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">100+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Players</div>
                </motion.div>

                <motion.div
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">3</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Prize Tiers</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Three simple steps to start making a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 8,
                  rotateX: 8,
                }}
                transition={{ 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 600,
                  damping: 20
                }}
                style={{ 
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
                className="relative bg-gray-50 dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all group overflow-hidden"
              >
                {/* Animated gradient border on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(16, 185, 129, 0.3), transparent 70%)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <div className="absolute top-8 right-8 text-6xl font-bold text-emerald-100 dark:text-emerald-900/30">
                  {item.step}
                </div>
                
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Structure */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Trophy className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Win Big Every Month
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Three prize tiers with every monthly draw
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 5-Match Jackpot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 8,
                rotateX: 8,
              }}
              transition={{ 
                type: "spring",
                stiffness: 600,
                damping: 20
              }}
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-emerald-500 dark:border-emerald-400 overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/20 transition-all"
            >
              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                JACKPOT
              </div>
              
              <div className="text-center mt-8">
                <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">40%</div>
                <div className="text-gray-600 dark:text-gray-400 mb-6">of prize pool</div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5-Number Match</h3>
                
                <ul className="text-left space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Jackpot prize + 40% of monthly pool</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Rolls over if unclaimed</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* 4-Match */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring", stiffness: 600, damping: 20 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 8,
                rotateX: 8,
              }}
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
            >
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">35%</div>
                <div className="text-gray-600 dark:text-gray-400 mb-6">of prize pool</div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4-Number Match</h3>
                
                <ul className="text-left space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Significant prize tier</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Split equally among winners</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* 3-Match */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 600, damping: 20 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 8,
                rotateX: 8,
              }}
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
            >
              <div className="text-center">
                <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">25%</div>
                <div className="text-gray-600 dark:text-gray-400 mb-6">of prize pool</div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3-Number Match</h3>
                
                <ul className="text-left space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Entry-level prize</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Best odds of winning</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      {charities && charities.length > 0 && (
        <section className="py-24 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <Heart className="w-16 h-16 text-pink-600 dark:text-pink-400 mx-auto mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Charities
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Making a real difference together
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {charities.map((charity) => (
                <Link
                  key={charity.id}
                  href={`/charities/${charity.id}`}
                  className="group bg-gray-50 dark:bg-slate-900 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-400 transition-all hover:shadow-xl"
                >
                  {charity.image_url && (
                    <div className="aspect-video overflow-hidden bg-gray-200 dark:bg-slate-800">
                      <img
                        src={charity.image_url}
                        alt={charity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      {charity.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                      {charity.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/charities"
                className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold text-lg group"
              >
                View All Charities
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-emerald-50 mb-8">
              Join hundreds of golfers who are playing for a purpose. Every score you submit helps support amazing causes.
            </p>
            
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <p className="mt-6 text-emerald-100 text-sm">
              No credit card required • Cancel anytime • 20% goes to charity
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-lg">GolfCharity</span>
              </div>
              <p className="text-gray-400 text-sm">
                Play golf, support charities, and win amazing prizes every month.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/charities" className="hover:text-emerald-400 transition-colors">Charities</Link></li>
                <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Twitter</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Facebook</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Instagram</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 GolfCharity Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

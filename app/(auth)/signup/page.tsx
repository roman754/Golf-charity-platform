'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Charity } from '@/types/database';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [charityId, setCharityId] = useState('');
  const [charityPercentage, setCharityPercentage] = useState(10);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadCharities();
  }, []);

  const loadCharities = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('charities')
      .select('*')
      .order('name');
    
    if (data) {
      setCharities(data);
      if (data.length > 0) {
        setCharityId(data[0].id);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    
    // Sign up user with role in metadata so trigger creates profile correctly
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // Pass role to trigger
          charity_id: role === 'user' ? charityId : null,
          charity_percentage: role === 'user' ? charityPercentage : null,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Wait a moment for the profile trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile not found:', profileError);
        setError('Account created but profile setup failed. Please contact support.');
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/subscribe');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border-2 border-gray-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join Us</h1>
            <p className="text-gray-600 dark:text-gray-400">Create your account and start giving back</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg p-3 text-red-700 dark:text-red-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Type
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              >
                <option value="user" className="bg-white dark:bg-slate-800">User (For golf scores & prizes)</option>
                <option value="admin" className="bg-white dark:bg-slate-800">Admin (For platform management)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {role === 'admin' 
                  ? 'Admin can manage draws, winners, and view analytics' 
                  : 'User can submit scores and participate in draws'}
              </p>
            </div>

            {role === 'user' && (
              <>
                <div>
                  <label htmlFor="charity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Your Charity
                  </label>
                  <select
                    id="charity"
                    value={charityId}
                    onChange={(e) => setCharityId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                  >
                    {charities.map((charity) => (
                      <option key={charity.id} value={charity.id} className="bg-white dark:bg-slate-800">
                        {charity.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Charity Contribution: {charityPercentage}%
                  </label>
                  <input
                    id="percentage"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={charityPercentage}
                    onChange={(e) => setCharityPercentage(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum 10% of your subscription goes to your chosen charity
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

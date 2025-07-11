  'use client';

  import { useState } from 'react';
  import { useAdminStore } from '@/lib/adminStore';

  interface AdminLoginProps {
    onSuccess: () => void;
  }

  export default function AdminLogin({ onSuccess }: AdminLoginProps) {
    const { login, loading, error } = useAdminStore();
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const success = await login(password);
      if (success) {
        onSuccess();
      }
    };

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">🔐 Admin Access</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Enter admin password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Checking...' : 'Access Admin Panel'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              For demo purposes, password is: <span className="text-blue-400 font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
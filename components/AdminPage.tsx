'use client';

import { useState } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAdminLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={handleAdminLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🛠️</div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors text-sm bg-gray-700 px-3 py-2 rounded"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Dashboard Content */}
      <div className="p-6">
        <AdminDashboard />
      </div>
    </div>
  );
}
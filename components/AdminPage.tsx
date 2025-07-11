'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/lib/adminStore';
import AdminLoginNew from '@/components/AdminLoginNew';
import AdminDashboardNew from '@/components/AdminDashboardNew';

export default function AdminPage() {
  const { isAuthenticated, logout, initializeAuth } = useAdminStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleAdminLogin = () => {
    // Login is handled in the AdminStore
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return <AdminLoginNew onSuccess={handleAdminLogin} />;
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
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Aviator Crash Game
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors text-sm bg-gray-700 px-3 py-2 rounded flex items-center space-x-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Dashboard Content */}
      <AdminDashboardNew />
    </div>
  );
}
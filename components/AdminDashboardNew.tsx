'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/lib/adminStore';

// Import sub-components
import StatsOverview from './admin/StatsOverview';
import UserManagement from './admin/UserManagement';
import TransactionManagement from './admin/TransactionManagement';
import GameControls from './admin/GameControls';
import Analytics from './admin/Analytics';
import AdminLogs from './admin/AdminLogs';

type TabType = 'overview' | 'users' | 'transactions' | 'game' | 'analytics' | 'logs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { fetchStats, stats, error, setError } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'transactions', label: '💰 Transactions', icon: '💰' },
    { id: 'game', label: '🎮 Game Controls', icon: '🎮' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'logs', label: '📝 Admin Logs', icon: '📝' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <StatsOverview />;
      case 'users':
        return <UserManagement />;
      case 'transactions':
        return <TransactionManagement />;
      case 'game':
        return <GameControls />;
      case 'analytics':
        return <Analytics />;
      case 'logs':
        return <AdminLogs />;
      default:
        return <StatsOverview />;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">
          Manage users, transactions, and game settings for the Aviator crash game
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-blue-400 text-sm font-medium">Total Users</div>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-green-400 text-sm font-medium">Active Users</div>
            <div className="text-2xl font-bold text-white">{stats.activeUsers.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-yellow-400 text-sm font-medium">Total Bets</div>
            <div className="text-2xl font-bold text-white">{stats.totalBets.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-purple-400 text-sm font-medium">Volume</div>
            <div className="text-2xl font-bold text-white">{stats.totalVolume.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-red-400 text-sm font-medium">Payouts</div>
            <div className="text-2xl font-bold text-white">{stats.totalPayout.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-emerald-400 text-sm font-medium">Profit</div>
            <div className="text-2xl font-bold text-white">{stats.profit.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}

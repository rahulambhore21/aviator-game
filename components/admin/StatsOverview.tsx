'use client';

import { useAdminStore } from '@/lib/adminStore';

export default function StatsOverview() {
  const { stats, loading } = useAdminStore();

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-3"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const winRate = stats.totalVolume > 0 ? ((stats.totalPayout / stats.totalVolume) * 100).toFixed(1) : '0';
  const profitMargin = stats.totalVolume > 0 ? ((stats.profit / stats.totalVolume) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users Card */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">User Statistics</h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Users:</span>
              <span className="text-white font-medium">{stats.totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active (24h):</span>
              <span className="text-green-400 font-medium">{stats.activeUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Activity Rate:</span>
              <span className="text-blue-400 font-medium">
                {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>
        </div>

        {/* Financial Card */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Financial Overview</h3>
            <span className="text-2xl">💰</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Volume:</span>
              <span className="text-white font-medium">{stats.totalVolume.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Payouts:</span>
              <span className="text-red-400 font-medium">{stats.totalPayout.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Net Profit:</span>
              <span className={`font-medium ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.profit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Game Statistics Card */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Game Statistics</h3>
            <span className="text-2xl">🎮</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Bets:</span>
              <span className="text-white font-medium">{stats.totalBets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate:</span>
              <span className="text-yellow-400 font-medium">{winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">House Edge:</span>
              <span className="text-purple-400 font-medium">{profitMargin}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Round Info */}
      {stats.currentRound && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Current Round</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              stats.currentRound.isActive 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
            }`}>
              {stats.currentRound.isActive ? '🔴 Active' : '🟡 Betting'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Round ID</div>
              <div className="text-white font-mono text-sm">{stats.currentRound.id}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Active Bets</div>
              <div className="text-white font-medium">{stats.currentRound.betsCount}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Round Volume</div>
              <div className="text-white font-medium">{stats.currentRound.totalVolume.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Status</div>
              <div className="text-white font-medium">
                {stats.currentRound.isActive ? 'In Progress' : 'Accepting Bets'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Transactions Alert */}
      {stats.pendingTransactions > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">
                {stats.pendingTransactions} pending transaction{stats.pendingTransactions !== 1 ? 's' : ''} require attention
              </span>
            </div>
            <button 
              onClick={() => {/* Navigate to transactions tab */}}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Review Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

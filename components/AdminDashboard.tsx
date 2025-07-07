'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import api from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalBets: number;
  totalVolume: number;
  currentRound: {
    id: string;
    isActive: boolean;
    betsCount: number;
    totalVolume: number;
  };
}

export default function AdminDashboard() {
  const { user, socket } = useStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [manualCrash, setManualCrash] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const startRound = () => {
    if (socket) {
      socket.emit('admin-start-round');
    }
  };

  const pauseRound = () => {
    if (socket) {
      socket.emit('admin-pause-round');
    }
  };

  const setCrashPoint = () => {
    const crashPoint = parseFloat(manualCrash);
    if (socket && crashPoint > 1) {
      socket.emit('admin-set-crash', { crashPoint });
      setManualCrash('');
    }
  };

  // Check if user is admin
  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied - Admin Only</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="container mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">🛠 Admin Dashboard</h1>
          
          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
                <div className="text-sm text-gray-400">Total Users</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{stats.totalBets}</div>
                <div className="text-sm text-gray-400">Total Bets</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">
                  {stats.totalVolume.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Volume</div>
              </div>
            </div>
          )}

          {/* Game Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Round Controls */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">🎮 Round Controls</h3>
              
              {stats?.currentRound && (
                <div className="mb-4 p-3 bg-gray-600 rounded">
                  <div className="text-white">Current Round: {stats.currentRound.id}</div>
                  <div className="text-sm text-gray-300">
                    Status: {stats.currentRound.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </div>
                  <div className="text-sm text-gray-300">
                    Bets: {stats.currentRound.betsCount} | 
                    Volume: {stats.currentRound.totalVolume}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={startRound}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                >
                  🚀 Start Round
                </button>
                <button
                  onClick={pauseRound}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                >
                  ⏸️ Pause Game
                </button>
              </div>
            </div>

            {/* Manual Crash Control */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">💥 Manual Crash</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Set Crash Point (1.0 - 100.0)
                  </label>
                  <input
                    type="number"
                    value={manualCrash}
                    onChange={(e) => setManualCrash(e.target.value)}
                    placeholder="e.g., 2.5"
                    step="0.1"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={setCrashPoint}
                  disabled={!manualCrash || parseFloat(manualCrash) < 1}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
                >
                  🎯 Set Crash Point
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-400">
                ⚠️ Use this to manually set when the next round will crash. 
                Leave empty for random crash points.
              </div>
            </div>
          </div>

          {/* Refresh Stats */}
          <div className="mt-6">
            <button
              onClick={fetchStats}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              🔄 Refresh Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

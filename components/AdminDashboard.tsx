'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

interface AdminStats {
  totalUsers: number;
  totalBets: number;
  totalVolume: number;
  totalPayouts: number;
  activeUsers: number;
  recentRounds: Array<{
    roundId: string;
    crashPoint: number;
    betsCount: number;
    volume: number;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const { user, token } = useStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRound = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'start' })
      });
      
      if (response.ok) {
        alert('Round started manually!');
      }
    } catch (error) {
      console.error('Error starting round:', error);
    }
  };

  const handlePauseRound = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'pause' })
      });
      
      if (response.ok) {
        alert('Round paused!');
      }
    } catch (error) {
      console.error('Error pausing round:', error);
    }
  };

  const handleSetCrashPoint = async () => {
    const crashPointStr = prompt('Enter crash point (e.g., 2.5):');
    if (crashPointStr && !isNaN(Number(crashPointStr))) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/control`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'setCrash', crashPoint: parseFloat(crashPointStr) })
        });
        
        if (response.ok) {
          alert(`Manual crash point set to ${crashPointStr}x`);
        }
      } catch (error) {
        console.error('Error setting crash point:', error);
      }
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Access Denied - Admin Only</div>
          <div className="text-gray-400 text-sm mb-4">
            Current user: {user?.email || 'Not logged in'}
          </div>
          <div className="text-gray-400 text-sm mb-4">
            Admin status: {user?.isAdmin ? 'true' : 'false'}
          </div>
          <div className="text-gray-400 text-sm">
            Please login with admin credentials: admin@crashgame.com / admin123
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🎮 Admin Dashboard</h1>
        
        {/* Game Controls */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🎛️ Game Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleStartRound}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🚀 Start Round
            </button>
            <button
              onClick={handlePauseRound}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              ⏸️ Pause Round
            </button>
            <button
              onClick={handleSetCrashPoint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🎯 Set Crash Point
            </button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-400">{stats.totalUsers}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Bets</h3>
              <p className="text-3xl font-bold text-green-400">{stats.totalBets}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Volume</h3>
              <p className="text-3xl font-bold text-yellow-400">{stats.totalVolume.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-purple-400">{stats.activeUsers}</p>
            </div>
          </div>
        )}

        {/* Recent Rounds */}
        {stats?.recentRounds && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📊 Recent Rounds</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-gray-300 pb-2">Round ID</th>
                    <th className="text-gray-300 pb-2">Crash Point</th>
                    <th className="text-gray-300 pb-2">Bets</th>
                    <th className="text-gray-300 pb-2">Volume</th>
                    <th className="text-gray-300 pb-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentRounds.map((round, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="text-white py-2 font-mono text-sm">{round.roundId.slice(-8)}</td>
                      <td className="text-white py-2 font-bold">{round.crashPoint.toFixed(2)}x</td>
                      <td className="text-white py-2">{round.betsCount}</td>
                      <td className="text-white py-2">{round.volume.toLocaleString()}</td>
                      <td className="text-gray-400 py-2 text-sm">{new Date(round.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

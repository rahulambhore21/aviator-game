'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';

interface AnalyticsData {
  volumeData: Array<{ _id: string; volume: number; count: number }>;
  multiplierData: Array<{ _id: number | string; count: number }>;
  topPlayers: Array<{
    _id: string;
    totalBets: number;
    totalWins: number;
    betCount: number;
    user: { email: string };
  }>;
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAnalytics(timeframe);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMultiplierRangeLabel = (id: number | string) => {
    if (typeof id === 'string') return id;
    
    const ranges = {
      1: '1.00x - 1.99x',
      2: '2.00x - 2.99x', 
      3: '3.00x - 4.99x',
      5: '5.00x - 9.99x',
      10: '10.00x - 49.99x',
      50: '50.00x - 99.99x'
    };
    
    return ranges[id as keyof typeof ranges] || `${id}x+`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="h-40 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Selector */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">📈 Analytics Dashboard</h2>
          <div className="flex space-x-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`px-4 py-2 rounded transition-colors ${
                  timeframe === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>
        <p className="text-gray-400">
          Comprehensive analytics for the last {timeframe} days to help you understand game performance and player behavior.
        </p>
      </div>

      {analyticsData && (
        <>
          {/* Bet Volume Over Time */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Bet Volume Over Time</h3>
            
            {analyticsData.volumeData.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <div className="flex space-x-2 min-w-max">
                    {analyticsData.volumeData.map((day, index) => {
                      const maxVolume = Math.max(...analyticsData.volumeData.map(d => d.volume));
                      const height = maxVolume > 0 ? (day.volume / maxVolume) * 200 : 0;
                      
                      return (
                        <div key={day._id} className="flex flex-col items-center space-y-2">
                          <div className="relative bg-gray-700 w-16 h-48 rounded-t-lg overflow-hidden">
                            <div 
                              className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                              style={{ height: `${height}px` }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 text-center">
                            <div>{formatDate(day._id)}</div>
                            <div className="font-medium text-white">{day.volume.toLocaleString()}</div>
                            <div>{day.count} bets</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-blue-400 text-sm font-medium">Total Volume</div>
                    <div className="text-xl font-bold text-white">
                      {analyticsData.volumeData.reduce((sum, day) => sum + day.volume, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-green-400 text-sm font-medium">Total Bets</div>
                    <div className="text-xl font-bold text-white">
                      {analyticsData.volumeData.reduce((sum, day) => sum + day.count, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-yellow-400 text-sm font-medium">Avg Daily Volume</div>
                    <div className="text-xl font-bold text-white">
                      {analyticsData.volumeData.length > 0 
                        ? Math.round(analyticsData.volumeData.reduce((sum, day) => sum + day.volume, 0) / analyticsData.volumeData.length).toLocaleString()
                        : 0
                      }
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-purple-400 text-sm font-medium">Avg Bet Size</div>
                    <div className="text-xl font-bold text-white">
                      {analyticsData.volumeData.reduce((sum, day) => sum + day.count, 0) > 0
                        ? Math.round(analyticsData.volumeData.reduce((sum, day) => sum + day.volume, 0) / analyticsData.volumeData.reduce((sum, day) => sum + day.count, 0)).toLocaleString()
                        : 0
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No volume data available for this timeframe
              </div>
            )}
          </div>

          {/* Multiplier Distribution */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Crash Point Distribution</h3>
            
            {analyticsData.multiplierData.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.multiplierData.map((range) => {
                    const total = analyticsData.multiplierData.reduce((sum, r) => sum + r.count, 0);
                    const percentage = total > 0 ? ((range.count / total) * 100).toFixed(1) : '0';
                    
                    return (
                      <div key={range._id} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 font-medium">
                            {getMultiplierRangeLabel(range._id)}
                          </span>
                          <span className="text-white font-bold">{percentage}%</span>
                        </div>
                        <div className="bg-gray-600 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {range.count} rounds
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No multiplier data available for this timeframe
              </div>
            )}
          </div>

          {/* Top Players */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">🏆 Top Players ({timeframe} days)</h3>
            
            {analyticsData.topPlayers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Rank</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Player</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Total Bets</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Total Wins</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Bet Count</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topPlayers.map((player, index) => {
                      const winRate = player.totalBets > 0 ? ((player.totalWins / player.totalBets) * 100).toFixed(1) : '0';
                      const avgBet = player.betCount > 0 ? Math.round(player.totalBets / player.betCount) : 0;
                      
                      return (
                        <tr key={player._id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white font-medium">{player.user.email}</div>
                            <div className="text-gray-400 text-sm">Avg bet: {avgBet.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white font-medium">{player.totalBets.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-green-400 font-medium">{player.totalWins.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{player.betCount.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`font-medium ${parseFloat(winRate) > 50 ? 'text-green-400' : 'text-red-400'}`}>
                              {winRate}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No player data available for this timeframe
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

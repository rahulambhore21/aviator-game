'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function RecentCrashes() {
  const { gameState } = useStore();
  const { crashed, crashPoint } = gameState;
  const [recentCrashes, setRecentCrashes] = useState<number[]>([
    // Default recent crashes to show immediately
    2.47, 1.23, 8.91, 1.56, 3.21, 5.67, 2.14, 12.34, 1.89, 4.56,
    7.23, 1.67, 3.45, 2.89, 6.12, 1.34, 4.78, 9.23, 2.56, 3.67
  ]);

  // Connect to socket for crash history updates (even without login)
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002');

    // Listen for crash history updates
    socket.on('history-update', (history: Array<{ crashPoint: number }>) => {
      const crashPoints = history.map(h => h.crashPoint);
      setRecentCrashes(crashPoints);
    });

    // Listen for new crashes
    socket.on('game-crashed', (crashPoint: number) => {
      setRecentCrashes(prev => [crashPoint, ...prev.slice(0, 19)]);
    });

    // Request initial history
    socket.emit('get-history');

    return () => {
      socket.disconnect();
    };
  }, []);

  // Also track crashes from main game state (backup)
  useEffect(() => {
    if (crashed && crashPoint) {
      setRecentCrashes(prev => [crashPoint, ...prev.slice(0, 19)]);
    }
  }, [crashed, crashPoint]);

  const getColorForMultiplier = (mult: number) => {
    if (mult >= 10) return 'text-purple-400';
    if (mult >= 5) return 'text-blue-400';
    if (mult >= 2) return 'text-green-400';
    if (mult >= 1) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Always show the component, even with empty crashes
  return (
    <div className="mb-3">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-600 w-full">
        <div className="flex justify-start space-x-2 overflow-x-auto scrollbar-hide">
          {recentCrashes.length > 0 ? (
            recentCrashes.map((crash, index) => (
              <div
                key={index}
                className={`text-xs font-bold px-2 py-1 rounded ${getColorForMultiplier(crash)} bg-gray-700/50 whitespace-nowrap flex-shrink-0`}
              >
                {crash.toFixed(2)}x
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500 text-center w-full py-1">
              No recent crashes yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
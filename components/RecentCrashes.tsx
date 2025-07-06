'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function RecentCrashes() {
  const { gameState } = useStore();
  const { crashed, crashPoint } = gameState;
  const [recentCrashes, setRecentCrashes] = useState<number[]>([]);

  // Track recent crashes
  useEffect(() => {
    if (crashed && crashPoint) {
      setRecentCrashes(prev => [crashPoint, ...prev.slice(0, 19)]); // Keep last 20 crashes
    }
  }, [crashed, crashPoint]);

  const getColorForMultiplier = (mult: number) => {
    if (mult >= 10) return 'text-purple-400';
    if (mult >= 5) return 'text-blue-400';
    if (mult >= 2) return 'text-green-400';
    if (mult >= 1) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (recentCrashes.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-600 w-full">
        <div className="flex justify-start space-x-2 overflow-x-auto scrollbar-hide">
          {recentCrashes.map((crash, index) => (
            <div
              key={index}
              className={`text-xs font-bold px-2 py-1 rounded ${getColorForMultiplier(crash)} bg-gray-700/50 whitespace-nowrap flex-shrink-0`}
            >
              {crash.toFixed(2)}x
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
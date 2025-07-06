'use client';

import { useState, useEffect } from 'react';

interface CrashResult {
  roundId: string;
  crashPoint: number;
  timestamp: Date;
}

export default function CrashHistory() {
  const [crashHistory, setCrashHistory] = useState<CrashResult[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch this from the backend
    // For now, we'll simulate some recent crashes
    const mockHistory: CrashResult[] = [
      { roundId: 'round_1', crashPoint: 2.47, timestamp: new Date(Date.now() - 60000) },
      { roundId: 'round_2', crashPoint: 1.23, timestamp: new Date(Date.now() - 120000) },
      { roundId: 'round_3', crashPoint: 8.91, timestamp: new Date(Date.now() - 180000) },
      { roundId: 'round_4', crashPoint: 1.56, timestamp: new Date(Date.now() - 240000) },
      { roundId: 'round_5', crashPoint: 3.21, timestamp: new Date(Date.now() - 300000) },
    ];
    
    setCrashHistory(mockHistory);
  }, []);

  const getColorForMultiplier = (multiplier: number) => {
    if (multiplier < 1.5) return 'text-red-400';
    if (multiplier < 3.0) return 'text-yellow-400';
    if (multiplier < 5.0) return 'text-green-400';
    return 'text-purple-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">📈 Recent Crashes</h3>
      
      <div className="space-y-2">
        {crashHistory.map((crash, index) => (
          <div 
            key={crash.roundId}
            className="flex justify-between items-center p-2 sm:p-3 bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">#{index + 1}</span>
              <span className={`font-bold text-lg ${getColorForMultiplier(crash.crashPoint)}`}>
                {crash.crashPoint.toFixed(2)}x
              </span>
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">
              {crash.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg sm:text-xl font-bold text-red-400">
              {crashHistory.filter(c => c.crashPoint < 2.0).length}
            </div>
            <div className="text-xs text-gray-400">Under 2x</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-yellow-400">
              {crashHistory.filter(c => c.crashPoint >= 2.0 && c.crashPoint < 5.0).length}
            </div>
            <div className="text-xs text-gray-400">2x - 5x</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-purple-400">
              {crashHistory.filter(c => c.crashPoint >= 5.0).length}
            </div>
            <div className="text-xs text-gray-400">Over 5x</div>
          </div>
        </div>
      </div>
    </div>
  );
}

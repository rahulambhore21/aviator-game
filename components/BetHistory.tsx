'use client';

import { useStore } from '@/lib/store';

export default function BetHistory() {
  const { betHistory } = useStore();

  if (betHistory.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📜 Bet History</h3>
        <div className="text-gray-400 text-center py-8">
          No bets yet. Place your first bet to see history here!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-bold text-white mb-3">📜 Bet History</h3>
      
      {/* Compact bet list */}
      <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
        {betHistory.slice(0, 8).map((bet) => (
          <div
            key={bet.id}
            className={`p-2 sm:p-3 rounded-lg border-l-4 ${
              bet.cashedOut
                ? 'bg-green-600/10 border-green-500'
                : 'bg-red-600/10 border-red-500'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-white font-medium text-xs sm:text-sm">
                  {bet.amount}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(bet.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              <div className="text-right">
                {bet.cashedOut ? (
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-green-400 font-bold text-xs sm:text-sm">
                      +{bet.payout}
                    </span>
                    <span className="text-green-300 text-xs">
                      {bet.multiplier?.toFixed(2)}x
                    </span>
                  </div>
                ) : (
                  <span className="text-red-400 font-bold text-xs sm:text-sm">
                    Lost
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compact Summary Stats */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          <div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {betHistory.length}
            </div>
            <div className="text-xs text-gray-400">Bets</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-green-400">
              {betHistory.filter(bet => bet.cashedOut).length}
            </div>
            <div className="text-xs text-gray-400">Wins</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-red-400">
              {betHistory.filter(bet => !bet.cashedOut).length}
            </div>
            <div className="text-xs text-gray-400">Loss</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-blue-400">
              {betHistory.length > 0 ? 
                Math.round((betHistory.filter(bet => bet.cashedOut).length / betHistory.length) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-400">Win%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

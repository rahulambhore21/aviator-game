'use client';

import { useStore } from '@/lib/store';

export default function CountdownTimer() {
  const { gameState } = useStore();
  const { timeRemaining, bettingPhase } = gameState;

  if (!bettingPhase || timeRemaining <= 0) return null;

  const seconds = Math.ceil(timeRemaining / 1000);
  const progress = ((5000 - timeRemaining) / 5000) * 100;

  return (
    <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-40 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg">
      <div className="text-center">
        <div className="text-lg sm:text-xl font-bold">⏰ {seconds}s</div>
        <div className="text-xs sm:text-sm">Betting closes in</div>
        
        {/* Progress bar */}
        <div className="w-20 sm:w-24 h-1 bg-yellow-800 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-yellow-300 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

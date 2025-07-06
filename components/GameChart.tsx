'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function GameChart() {
  const { gameState, currentBet, cashOut } = useStore();
  const { multiplier, isActive, crashed, crashPoint } = gameState;
  const [multiplierHistory, setMultiplierHistory] = useState<number[]>([]);

  // Track multiplier history for chart line
  useEffect(() => {
    if (isActive && !crashed) {
      setMultiplierHistory(prev => [...prev.slice(-50), multiplier]); // Keep last 50 points
    } else if (gameState.bettingPhase) {
      setMultiplierHistory([]); // Reset for new round
    }
  }, [multiplier, isActive, crashed, gameState.bettingPhase]);

  const getChartColor = () => {
    if (crashed) return 'text-red-500';
    if (multiplier > 5) return 'text-purple-400';
    if (multiplier > 3) return 'text-blue-400';
    if (multiplier > 2) return 'text-green-400';
    if (multiplier > 1) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getGradientColor = () => {
    if (crashed) return 'from-red-500/40 via-red-400/20 to-transparent';
    if (multiplier > 5) return 'from-purple-500/40 via-purple-400/20 to-transparent';
    if (multiplier > 3) return 'from-blue-500/40 via-blue-400/20 to-transparent';
    if (multiplier > 2) return 'from-green-500/40 via-green-400/20 to-transparent';
    if (multiplier > 1) return 'from-yellow-500/40 via-yellow-400/20 to-transparent';
    return 'from-gray-500/40 via-gray-400/20 to-transparent';
  };

  const getPlaneTrailColor = () => {
    if (multiplier > 5) return 'rgba(168, 85, 247, 0.4)'; // Purple
    if (multiplier > 3) return 'rgba(59, 130, 246, 0.4)'; // Blue
    if (multiplier > 2) return 'rgba(34, 197, 94, 0.4)'; // Green
    if (multiplier > 1) return 'rgba(234, 179, 8, 0.4)'; // Yellow
    return 'rgba(156, 163, 175, 0.4)'; // Gray
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 relative overflow-hidden border border-gray-700 shadow-2xl">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5 animate-pulse"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border-gray-600/30 border-r border-b last:border-r-0"></div>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="relative h-56 sm:h-72 flex items-end justify-center">
        {/* Dynamic Background Gradient */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t ${getGradientColor()} transition-all duration-300`}
          style={{
            opacity: isActive ? 0.3 : 0.1,
            transform: `scaleY(${Math.min(multiplier / 5, 1)})`
          }}
        />

        {/* Chart Line Path */}
        {multiplierHistory.length > 1 && isActive && (
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={getPlaneTrailColor()} stopOpacity="0.8" />
                <stop offset="100%" stopColor={getPlaneTrailColor()} stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              d={`M 0 ${100}% ${multiplierHistory.map((mult, i) => 
                `L ${(i / (multiplierHistory.length - 1)) * 100}% ${100 - Math.min((mult / 8) * 100, 90)}%`
              ).join(' ')}`}
              stroke="url(#chartGradient)"
              strokeWidth="3"
              fill="none"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Multiplier Display */}
        <div className="relative z-10 text-center">
          {crashed ? (
            <div className="flex flex-col items-center animate-bounce">
              <div className="text-6xl sm:text-8xl mb-2">💥</div>
              <div className="text-red-400 text-2xl sm:text-4xl font-bold mb-2">CRASHED!</div>
              <div className="text-red-300 text-lg sm:text-2xl font-semibold">
                at {crashPoint?.toFixed(2)}x
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className={`text-5xl sm:text-8xl font-bold ${getChartColor()} transition-all duration-200 drop-shadow-2xl`}>
                {multiplier.toFixed(2)}x
              </div>
              {isActive && (
                <div className="text-sm sm:text-base text-gray-400 mt-2 animate-pulse">
                  {multiplier > 3 ? '🚀 TO THE MOON!' : 
                   multiplier > 2 ? '⚡ GAINING SPEED!' : 
                   multiplier > 1 ? '📈 CLIMBING...' : '🛫 TAKING OFF...'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Animated Plane with Enhanced Effects */}
        {(isActive || gameState.bettingPhase) && !crashed && (
          <div 
            className="absolute transition-all duration-75 z-20"
            style={{ 
              left: `${Math.min((multiplier / 4) * 80, 80)}%`,
              bottom: `${Math.min((multiplier / 8) * 80, 80)}%`,
              transform: `translate(-50%, 50%) rotate(${Math.min(multiplier * 8, 45)}deg)`,
              transformOrigin: 'center'
            }}
          >
            {/* Plane Glow Effect */}
            <div className="absolute inset-0 bg-white/20 rounded-full blur-lg scale-150 animate-pulse"></div>
            
            {/* Main Plane */}
            <div className={`relative text-3xl sm:text-4xl transition-all duration-75 ${
              multiplier > 3 ? 'text-purple-400 animate-pulse' : 
              multiplier > 2 ? 'text-green-400' : 
              multiplier > 1 ? 'text-yellow-400' : 'text-blue-400'
            }`}>
              ✈️
            </div>
            
            {/* Speed Lines */}
            {multiplier > 1.5 && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-0.5 bg-white/40 animate-pulse"></div>
                  <div className="w-1 h-0.5 bg-white/30 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-0.5 bg-white/20 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Crash Explosion Effect */}
        {crashed && (
          <div 
            className="absolute animate-ping z-30"
            style={{ 
              left: `${Math.min((crashPoint! / 4) * 80, 80)}%`,
              bottom: `${Math.min((crashPoint! / 8) * 80, 80)}%`,
              transform: 'translate(-50%, 50%)'
            }}
          >
            <div className="text-6xl sm:text-8xl text-red-500">💥</div>
          </div>
        )}

        {/* Plane Trail with Better Visual */}
        {isActive && !crashed && multiplier > 0.5 && (
          <div 
            className="absolute bottom-0 left-0 opacity-40 transition-all duration-100"
            style={{
              width: `${Math.min((multiplier / 4) * 80, 80)}%`,
              height: `${Math.min((multiplier / 8) * 80, 80)}%`,
              background: `linear-gradient(45deg, transparent 0%, ${getPlaneTrailColor()} 30%, transparent 100%)`,
              clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
              filter: 'blur(1px)'
            }}
          />
        )}
      </div>

      {/* Enhanced Status Bar */}
      <div className="mt-4 px-2">
        {gameState.bettingPhase && !isActive && (
          <div className="flex items-center justify-center space-x-2 text-yellow-400 font-semibold text-sm sm:text-base">
            <span className="animate-bounce">🎯</span>
            <span>Betting Phase - Place your bets!</span>
            <span className="animate-bounce">🎯</span>
          </div>
        )}
        {isActive && !crashed && (
          <div className="flex items-center justify-center space-x-2 text-green-400 font-semibold text-sm sm:text-base">
            <span className="animate-pulse">🚀</span>
            <span>Flight in progress... Cash out anytime!</span>
            <span className="animate-pulse">🚀</span>
          </div>
        )}
        {crashed && (
          <div className="flex items-center justify-center space-x-2 text-red-400 font-semibold text-sm sm:text-base">
            <span className="animate-bounce">💥</span>
            <span>Flight crashed at {crashPoint?.toFixed(2)}x</span>
            <span className="animate-bounce">💥</span>
          </div>
        )}
      </div>

      {/* Enhanced Current Bet Display */}
      {currentBet && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-600 z-30">
          <div className="text-xs text-gray-300 mb-1">Your Bet</div>
          <div className="text-lg font-bold text-white flex items-center space-x-1">
            <span>🎲</span>
            <span>{currentBet.amount}</span>
          </div>
          {currentBet.active && (
            <div className="text-sm text-green-400 flex items-center space-x-1">
              <span>💎</span>
              <span>Win: {(currentBet.amount * multiplier).toFixed(0)}</span>
            </div>
          )}
        </div>
      )}

      {/* Multiplier Milestones */}
      {isActive && (
        <div className="absolute right-4 bottom-4 text-xs text-gray-400 space-y-1">
          <div className={`flex items-center space-x-1 ${multiplier >= 2 ? 'text-green-400' : ''}`}>
            <span>{multiplier >= 2 ? '✅' : '⭕'}</span>
            <span>2.00x</span>
          </div>
          <div className={`flex items-center space-x-1 ${multiplier >= 5 ? 'text-blue-400' : ''}`}>
            <span>{multiplier >= 5 ? '✅' : '⭕'}</span>
            <span>5.00x</span>
          </div>
          <div className={`flex items-center space-x-1 ${multiplier >= 10 ? 'text-purple-400' : ''}`}>
            <span>{multiplier >= 10 ? '✅' : '⭕'}</span>
            <span>10.0x</span>
          </div>
        </div>
      )}
    </div>
  );
}

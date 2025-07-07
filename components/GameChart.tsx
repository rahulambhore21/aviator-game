'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function GameChart() {
  const { gameState, currentBet, cashOut } = useStore();
  const { multiplier, isActive, crashed, crashPoint } = gameState;
  const [multiplierHistory, setMultiplierHistory] = useState<number[]>([]);

  useEffect(() => {
    if (isActive && !crashed) {
      setMultiplierHistory(prev => [...prev.slice(-50), multiplier]);
    } else if (gameState.bettingPhase) {
      setMultiplierHistory([]);
    }
  }, [multiplier, isActive, crashed, gameState.bettingPhase]);

  const getChartColor = () => {
    if (crashed) return 'text-blue-400';
    if (multiplier > 5) return 'text-purple-400';
    if (multiplier > 3) return 'text-blue-400';
    if (multiplier > 2) return 'text-green-400';
    if (multiplier > 1) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getGradientColor = () => {
    if (crashed) return 'from-blue-500/40 via-blue-400/20 to-transparent';
    if (multiplier > 5) return 'from-purple-500/40 via-purple-400/20 to-transparent';
    if (multiplier > 3) return 'from-blue-500/40 via-blue-400/20 to-transparent';
    if (multiplier > 2) return 'from-green-500/40 via-green-400/20 to-transparent';
    if (multiplier > 1) return 'from-yellow-500/40 via-yellow-400/20 to-transparent';
    return 'from-gray-500/40 via-gray-400/20 to-transparent';
  };

  const getPlaneTrailColor = () => {
    if (multiplier > 5) return 'rgba(168, 85, 247, 0.4)';
    if (multiplier > 3) return 'rgba(59, 130, 246, 0.4)';
    if (multiplier > 2) return 'rgba(34, 197, 94, 0.4)';
    if (multiplier > 1) return 'rgba(234, 179, 8, 0.4)';
    return 'rgba(156, 163, 175, 0.4)';
  };

  const playSound = (type: 'crash' | 'cashout') => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore audio errors if files don't exist
    });
  };

  useEffect(() => {
    if (crashed) playSound('crash');
  }, [crashed]);

  useEffect(() => {
    if (!crashed && currentBet && !currentBet.active) {
      playSound('cashout');
    }
  }, [currentBet?.active]);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 relative overflow-hidden border border-gray-700 shadow-2xl">
      <style jsx>{`
        @keyframes flyAway {
          0% { transform: translate(-50%, 50%) scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: translate(200%, -100%) scale(0.5) rotate(15deg); opacity: 0.4; }
          100% { transform: translate(400%, -200%) scale(0.2) rotate(30deg); opacity: 0; }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5 animate-pulse"></div>

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
            <div className="flex flex-col items-center">
              <div className="text-6xl sm:text-8xl mb-2">☁️</div>
              <div className="text-blue-400 text-2xl sm:text-4xl font-bold mb-2">
                {crashPoint?.toFixed(2)}x
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className={`text-5xl sm:text-8xl font-bold ${getChartColor()} transition-all duration-200 drop-shadow-2xl`}>
                {multiplier.toFixed(2)}x
              </div>
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
            
            {/* Speed Lines with enhanced visual */}
            {multiplier > 1.5 && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-3 h-0.5 bg-white/50 animate-pulse rounded-full"></div>
                  <div className="w-2 h-0.5 bg-white/40 animate-pulse rounded-full" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-0.5 bg-white/30 animate-pulse rounded-full" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plane Flying Away Effect */}
        {crashed && (
          <div 
            className="absolute z-30"
            style={{ 
              left: `${Math.min((crashPoint! / 4) * 80, 80)}%`,
              bottom: `${Math.min((crashPoint! / 8) * 80, 80)}%`,
              transform: 'translate(-50%, 50%)',
              animation: 'flyAway 2s ease-out forwards'
            }}
          >
            <div className="text-6xl sm:text-8xl text-blue-400 opacity-80">✈️</div>
            {/* Vapor trail effect */}
            <div className="absolute top-1/2 left-0 w-8 h-1 bg-gradient-to-r from-blue-300/60 to-transparent transform -translate-y-1/2 animate-pulse"></div>
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

      {/* Current Bet Display */}
      {currentBet && (
        <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-600 z-30">
          <div className="text-lg font-bold text-white">
            {currentBet.amount}
          </div>
          {currentBet.active && (
            <div className="text-sm text-green-400">
              {(currentBet.amount * multiplier).toFixed(0)}
            </div>
          )}
        </div>
      )}

      {/* Player Count Widget - Bottom Right Corner */}
      <div className="absolute bottom-4 right-4 z-30 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50 shadow-lg w-20">
        <div className="flex items-center gap-2">
          {/* Profile Photos */}
          <div className="flex -space-x-1">
            {[
              { bg: 'bg-blue-500' },
              { bg: 'bg-green-500' },
              { bg: 'bg-purple-500' },
            ].map((profile, index) => (
              <div 
                key={index} 
                className={`w-3 h-3 ${profile.bg} rounded-full border border-gray-700`}
              />
            ))}
          </div>
          
          {/* Player Count */}
          <div className="text-xs font-medium text-gray-300">
            247
          </div>
        </div>
      </div>
    </div>
  );
}

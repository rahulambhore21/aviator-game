'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import AuthForm from '@/components/AuthForm';
import Header from '@/components/Header';
import GameChart from '@/components/GameChart';
import BettingPanel from '@/components/BettingPanel';
import CountdownTimer from '@/components/CountdownTimer';
import ToastNotifications from '@/components/ToastNotifications';
import RecentCrashes from '@/components/RecentCrashes';

export default function GameDashboard() {
  const { user, gameState } = useStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [bettingCount, setBettingCount] = useState(247);

  // Animate betting count based on game state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.bettingPhase) {
      // During betting phase, numbers go up
      interval = setInterval(() => {
        setBettingCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      }, 1500);
    } else if (gameState.isActive) {
      // During round, numbers go down slightly
      interval = setInterval(() => {
        setBettingCount(prev => Math.max(prev - Math.floor(Math.random() * 2), prev - 1));
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [gameState.bettingPhase, gameState.isActive]);

  // Reset count when new round starts (genuine behavior)
  useEffect(() => {
    if (gameState.bettingPhase && !gameState.isActive) {
      // New round starting, reset to a realistic starting number
      setBettingCount(Math.floor(Math.random() * 50) + 180); // 180-230 range
    }
  }, [gameState.bettingPhase, gameState.isActive]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        
        {/* Show Recent Crashes even when not logged in */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <RecentCrashes />
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <AuthForm 
            mode={authMode} 
            onToggle={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
          />
        </div>
        <ToastNotifications />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-6 space-y-4 xl:space-y-0">
          
          {/* Left Side - Current Round Bets */}
          <div className="order-2 xl:order-1 space-y-4">
            {/* Current Round Bets */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">� Current Round Bets</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {/* Example bets with encrypted names */}
                {[
                  { id: 1, name: 'Player_3x9k', bet: 250, time: '2s ago' },
                  { id: 2, name: 'User_7m2n', bet: 150, time: '5s ago' },
                  { id: 3, name: 'Crypto_8p1q', bet: 500, time: '8s ago' },
                  { id: 4, name: 'Anon_4d7r', bet: 75, time: '12s ago' },
                  { id: 5, name: 'Gamer_9s5t', bet: 1000, time: '15s ago' },
                  { id: 6, name: 'Beta_6u3v', bet: 300, time: '18s ago' },
                  { id: 7, name: 'Alpha_2w8x', bet: 450, time: '22s ago' },
                  { id: 8, name: 'Pro_5y7z', bet: 200, time: '25s ago' },
                  { id: 9, name: 'Elite_1a4b', bet: 800, time: '28s ago' },
                  { id: 10, name: 'King_9c6d', bet: 100, time: '30s ago' },
                  { id: 11, name: 'Shark_3e8f', bet: 750, time: '35s ago' },
                  { id: 12, name: 'Wolf_7g2h', bet: 350, time: '38s ago' },
                ].map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg border-l-2 border-green-500">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-300">{bet.name}</div>
                      <div className="text-xs text-gray-500">{bet.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        {bet.bet.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">coins</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex justify-between text-sm">
                  <div className="text-gray-400">Total Bets:</div>
                  <div className="text-white font-bold">12</div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <div className="text-gray-400">Total Volume:</div>
                  <div className="text-green-400 font-bold">4,975 coins</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Game Chart and Betting Panel */}
          <div className="order-1 xl:order-2 xl:col-span-3 space-y-4">
            {/* Countdown Timer */}
            <CountdownTimer />
            
            {/* Recent Crashes */}
            <RecentCrashes />
            
            {/* Main Game Chart */}
            <GameChart />
            
            {/* Betting Panel */}
            <BettingPanel />
          </div>

        </div>
      </div>

      <ToastNotifications />
      
      {/* Bottom Right Corner - Minimalist Player Count */}
      <div className="fixed bottom-4 right-4 z-40 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50 shadow-lg w-24">
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
                className={`w-4 h-4 ${profile.bg} rounded-full border border-gray-700`}
              />
            ))}
          </div>
          
          {/* Just the Number */}
          <div className="text-xs font-medium text-gray-300">
            {bettingCount}
          </div>
        </div>
      </div>
    </div>
  );
}

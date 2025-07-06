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
  const { user } = useStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
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
        <div className="xl:grid xl:grid-cols-3 xl:gap-6 space-y-4 xl:space-y-0">
          
          {/* Game Chart */}
          <div className="order-1 xl:order-1 xl:col-span-2 space-y-4">
            {/* Countdown Timer */}
            <CountdownTimer />
            
            {/* Recent Crashes */}
            <RecentCrashes />
            
            {/* Main Game Chart */}
            <GameChart />
          </div>

          {/* Betting Panel */}
          <div className="order-2 xl:order-2 space-y-4">
            <BettingPanel />
          </div>

        </div>
      </div>

      <ToastNotifications />
    </div>
  );
}

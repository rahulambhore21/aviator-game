'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { backgroundMusic, soundManager } from '@/lib/sounds';

export default function Header() {
  const { user, logout } = useStore();
  const [soundStatus, setSoundStatus] = useState(() => soundManager.getSoundStatus());

  const toggleSound = () => {
    const enabled = soundManager.toggleSound();
    setSoundStatus(prev => ({ ...prev, soundEnabled: enabled }));
  };

  const toggleMusic = () => {
    const enabled = backgroundMusic.toggle();
    setSoundStatus(prev => ({ ...prev, musicEnabled: enabled }));
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-2xl sm:text-3xl">🎲</div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Crash Game</h1>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Bet, watch, cash out!</p>
            </div>
          </div>

          {/* Controls and User Info */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Sound Controls */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg transition-colors ${
                soundStatus.soundEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
              title={soundStatus.soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            >
              <span className="text-xs sm:text-sm">
                {soundStatus.soundEnabled ? '🔊' : '🔇'}
              </span>
            </button>

            <button
              onClick={toggleMusic}
              className={`p-2 rounded-lg transition-colors ${
                soundStatus.musicEnabled 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
              title={soundStatus.musicEnabled ? 'Mute Background Music' : 'Enable Background Music'}
            >
              <span className="text-xs sm:text-sm">
                {soundStatus.musicEnabled ? '🎵' : '🎵'}
              </span>
            </button>

            {/* User Info */}
            <div className="text-right">
              <div className="text-white font-medium text-sm sm:text-base truncate max-w-32 sm:max-w-none">
                {user?.email}
              </div>
              <div className="text-green-400 font-bold text-sm sm:text-base">
                {user?.balance?.toLocaleString() || 0} coins
              </div>
            </div>
            
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

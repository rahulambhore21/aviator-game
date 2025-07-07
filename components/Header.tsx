'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { soundControls } from '@/lib/sounds';

export default function Header() {
  const { user, logout } = useStore();

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">✈️</div>
            <h1 className="text-xl font-bold text-white">Aviator</h1>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-green-400 font-bold">
                {user.balance?.toLocaleString() || 0}
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

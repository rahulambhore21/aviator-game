'use client';

import { useState } from 'react';
import { useAdminStore } from '@/lib/adminStore';

export default function GameControls() {
  const { setCrashPoint, pauseGame, resumeGame, loading } = useAdminStore();
  
  const [crashPointValue, setCrashPointValue] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'crash' | 'pause' | 'resume';
    data?: any;
  } | null>(null);

  const handleSetCrashPoint = () => {
    const value = parseFloat(crashPointValue);
    if (!value || value < 1.01 || value > 100) {
      alert('Crash point must be between 1.01 and 100.00');
      return;
    }
    
    setPendingAction({ type: 'crash', data: value });
    setShowConfirmModal(true);
  };

  const handlePauseGame = () => {
    setPendingAction({ type: 'pause' });
    setShowConfirmModal(true);
  };

  const handleResumeGame = () => {
    setPendingAction({ type: 'resume' });
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;
    
    try {
      switch (pendingAction.type) {
        case 'crash':
          await setCrashPoint(pendingAction.data);
          setCrashPointValue('');
          break;
        case 'pause':
          await pauseGame();
          break;
        case 'resume':
          await resumeGame();
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
    
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const quickCrashPoints = [1.50, 2.00, 3.00, 5.00, 10.00];

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">🎮 Game Engine Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-green-400 text-sm font-medium">Engine Status</div>
            <div className="text-2xl font-bold text-white">🟢 Running</div>
            <div className="text-gray-400 text-sm mt-1">Last restart: 2 hours ago</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-blue-400 text-sm font-medium">Current Round</div>
            <div className="text-2xl font-bold text-white">#1234567</div>
            <div className="text-gray-400 text-sm mt-1">Status: Betting Phase</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-yellow-400 text-sm font-medium">Active Players</div>
            <div className="text-2xl font-bold text-white">89</div>
            <div className="text-gray-400 text-sm mt-1">Currently betting</div>
          </div>
        </div>
      </div>

      {/* Manual Crash Point */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🎯 Set Manual Crash Point</h3>
        <p className="text-gray-400 mb-4">
          Override the random crash point for the next round. Use this for testing or special events.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Crash Point (1.01 - 100.00)</label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={crashPointValue}
                onChange={(e) => setCrashPointValue(e.target.value)}
                placeholder="Enter crash point..."
                min="1.01"
                max="100"
                step="0.01"
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleSetCrashPoint}
                disabled={loading || !crashPointValue}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded transition-colors"
              >
                Set Crash Point
              </button>
            </div>
          </div>
          
          {/* Quick Crash Points */}
          <div>
            <div className="text-gray-400 text-sm mb-2">Quick Options:</div>
            <div className="flex flex-wrap gap-2">
              {quickCrashPoints.map((point) => (
                <button
                  key={point}
                  onClick={() => setCrashPointValue(point.toString())}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {point}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game Control Actions */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">⚡ Game Control Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pause Game */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">⏸️</span>
              <div>
                <h4 className="text-white font-medium">Pause Game Engine</h4>
                <p className="text-gray-400 text-sm">Temporarily stop all game rounds</p>
              </div>
            </div>
            <button
              onClick={handlePauseGame}
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
            >
              Pause Game
            </button>
          </div>

          {/* Resume Game */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">▶️</span>
              <div>
                <h4 className="text-white font-medium">Resume Game Engine</h4>
                <p className="text-gray-400 text-sm">Start a new betting round immediately</p>
              </div>
            </div>
            <button
              onClick={handleResumeGame}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
            >
              Resume Game
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-red-400 mb-4">⚠️ Danger Zone</h3>
        <p className="text-gray-400 mb-4">
          These actions can significantly impact the game experience. Use with extreme caution.
        </p>
        
        <div className="space-y-3">
          <button
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
          >
            🛑 Force End Current Round
          </button>
          <button
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
          >
            🔄 Restart Game Engine
          </button>
          <button
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
          >
            🚨 Emergency Stop All Games
          </button>
        </div>
      </div>

      {/* Recent Game Engine Logs */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Recent Engine Activity</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Round #1234567 ended with crash point 2.47x</span>
            <span className="text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">New betting phase started (7 seconds)</span>
            <span className="text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">89 players placed bets (total: 45,230 coins)</span>
            <span className="text-gray-500">3 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-400">Admin set manual crash point: 5.00x</span>
            <span className="text-gray-500">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-400">Game engine paused by admin</span>
            <span className="text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Action</h3>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 text-xl">⚠️</span>
                <span className="text-yellow-400 font-medium">This action will affect all players</span>
              </div>
            </div>
            
            <div className="mb-6">
              {pendingAction.type === 'crash' && (
                <p className="text-gray-300">
                  Set the next round's crash point to <strong>{pendingAction.data}x</strong>? 
                  This will override the random generation for one round only.
                </p>
              )}
              {pendingAction.type === 'pause' && (
                <p className="text-gray-300">
                  Pause the game engine? This will stop all current and future rounds until resumed.
                  Active bets will be cancelled and refunded.
                </p>
              )}
              {pendingAction.type === 'resume' && (
                <p className="text-gray-300">
                  Resume the game engine? This will start a new betting phase immediately.
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={executeAction}
                disabled={loading}
                className={`flex-1 ${
                  pendingAction.type === 'pause' 
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : pendingAction.type === 'resume'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded transition-colors`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingAction(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

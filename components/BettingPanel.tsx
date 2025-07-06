'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function BettingPanel() {
  const { user, gameState, currentBet, placeBet, cancelBet, cashOut } = useStore();
  const [betAmount, setBetAmount] = useState(100);

  const quickAmounts = [10, 50, 100, 500, 1000];

  const handleBet = () => {
    if (!user || betAmount <= 0 || betAmount > user.balance || currentBet?.active) return;
    placeBet(betAmount);
  };

  const handleCancel = () => {
    if (currentBet && !gameState.isActive && gameState.bettingPhase) {
      cancelBet();
    }
  };

  const handleCashOut = () => {
    if (currentBet?.active && gameState.isActive && !gameState.crashed) {
      cashOut();
    }
  };

  const canBet = user && 
                 betAmount > 0 && 
                 betAmount <= user.balance && 
                 !currentBet?.active && 
                 gameState.bettingPhase && 
                 !gameState.isActive;

  const canCancel = currentBet?.active && 
                    gameState.bettingPhase && 
                    !gameState.isActive;

  const canCashOut = currentBet?.active && 
                     gameState.isActive && 
                     !gameState.crashed;

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">💰 Place Your Bet</h3>
      
      {/* Balance Display */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <div className="text-sm text-gray-400">Your Balance</div>
        <div className="text-xl sm:text-2xl font-bold text-green-400">
          {user?.balance?.toLocaleString() || 0} coins
        </div>
      </div>

      {/* Bet Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bet Amount
        </label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          placeholder="Enter bet amount"
          min="1"
          max={user?.balance || 0}
        />
      </div>

      {/* Quick Amount Buttons */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Quick Select</div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              className={`py-2 px-2 sm:px-3 rounded-lg text-sm font-medium transition-colors ${
                betAmount === amount
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {amount >= 1000 ? `${amount/1000}k` : amount}
            </button>
          ))}
        </div>
      </div>

      {/* Max Button */}
      <button
        onClick={() => setBetAmount(user?.balance || 0)}
        className="w-full mb-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm sm:text-base"
      >
        All In ({user?.balance?.toLocaleString() || 0})
      </button>

      {/* Bet/Cancel/Cash Out Buttons */}
      {currentBet?.active ? (
        gameState.isActive && !gameState.crashed ? (
          // Cash Out Button during active game
          <button
            onClick={handleCashOut}
            disabled={!canCashOut}
            className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors ${
              canCashOut
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            💰 Cash Out ({(currentBet.amount * gameState.multiplier).toFixed(0)} coins)
          </button>
        ) : (
          // Cancel Button during betting phase
          <button
            onClick={handleCancel}
            disabled={!canCancel}
            className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors ${
              canCancel
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {gameState.crashed ? (
              '💥 Game Crashed'
            ) : (
              '❌ Cancel Bet'
            )}
          </button>
        )
      ) : (
        // Place Bet Button
        <button
          onClick={handleBet}
          disabled={!canBet}
          className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors ${
            canBet
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {gameState.isActive ? (
            '⏳ Game in Progress'
          ) : !gameState.bettingPhase ? (
            '⏰ Waiting for Next Round'
          ) : betAmount > (user?.balance || 0) ? (
            '💸 Insufficient Balance'
          ) : (
            `🎲 Bet ${betAmount} coins`
          )}
        </button>
      )}

      {/* Current Bet Info */}
      {currentBet && (
        <div className="mt-4 p-3 bg-blue-600/20 border border-blue-500 rounded-lg">
          <div className="text-sm text-blue-300">Active Bet</div>
          <div className="text-lg font-bold text-white">{currentBet.amount} coins</div>
          {gameState.isActive && (
            <div className="text-sm text-green-400">
              Potential payout: {(currentBet.amount * gameState.multiplier).toFixed(0)} coins
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

interface NextRoundBet {
  amount: number;
  timestamp: number;
}

interface AutoBettingSettings {
  enabled: boolean;
  autoCashOutAt: number;
}

interface BetPanelProps {
  panelId: 'panel1' | 'panel2';
  title: string;
}

function SingleBettingPanel({ panelId, title }: BetPanelProps) {
  const { user, gameState, currentBet, placeBet, cancelBet, cashOut } = useStore();
  const [betAmount, setBetAmount] = useState(100);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoCashOut, setAutoCashOut] = useState(2.0);
  const [nextRoundBet, setNextRoundBet] = useState<NextRoundBet | null>(null);

  const quickAmounts = [100, 200, 500, 1000];

  const incrementBet = () => {
    setBetAmount(prev => Math.min(prev + 10, user?.balance || 0));
  };

  const decrementBet = () => {
    setBetAmount(prev => Math.max(10, prev - 10));
  };

  const handleQuickAmount = (amount: number) => {
    setBetAmount(amount);
  };

  // Auto cash out logic
  useEffect(() => {
    if (!user || !isAutoMode) return;

    if (currentBet?.active && gameState.isActive && gameState.multiplier >= autoCashOut) {
      cashOut();
    }
  }, [autoCashOut, gameState, currentBet, cashOut, isAutoMode]);

  const handleBet = () => {
    if (!user || betAmount <= 0 || betAmount > user.balance) return;
    
    if (gameState.isActive && !currentBet?.active && !nextRoundBet) {
      setNextRoundBet({
        amount: betAmount,
        timestamp: Date.now()
      });
      return;
    }
    
    if (!currentBet?.active && gameState.bettingPhase && !gameState.isActive) {
      placeBet(betAmount);
    }
  };

  const handleCancelNextRound = () => {
    setNextRoundBet(null);
  };

  // Auto-place bet when new round starts
  useEffect(() => {
    if (nextRoundBet && gameState.bettingPhase && !gameState.isActive && !currentBet?.active) {
      if (nextRoundBet.amount <= (user?.balance || 0)) {
        placeBet(nextRoundBet.amount);
        setNextRoundBet(null);
      } else {
        setNextRoundBet(null);
      }
    }
  }, [gameState.bettingPhase, gameState.isActive, nextRoundBet, currentBet, user?.balance, placeBet]);

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

  const canBetNextRound = user && 
                          betAmount > 0 && 
                          betAmount <= user.balance && 
                          !currentBet?.active && 
                          gameState.isActive && 
                          !nextRoundBet;

  const canCancel = currentBet?.active && 
                    gameState.bettingPhase && 
                    !gameState.isActive;

  const canCashOut = currentBet?.active && 
                     gameState.isActive && 
                     !gameState.crashed;

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      {/* Panel Title */}
      <div className="text-center mb-4">
        <div className="text-sm font-medium text-gray-300">{title}</div>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-gray-700 rounded-lg p-0.5 mb-6">
        <button
          onClick={() => setIsAutoMode(false)}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm transition-colors ${
            !isAutoMode 
              ? 'bg-gray-600 text-white' 
              : 'text-gray-400'
          }`}
        >
          Bet
        </button>
        <button
          onClick={() => setIsAutoMode(true)}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm transition-colors ${
            isAutoMode 
              ? 'bg-gray-600 text-white' 
              : 'text-gray-400'
          }`}
        >
          Auto
        </button>
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center gap-4 mb-6">
        {/* Left Side - Bet Amount Controls */}
        <div className="flex-1">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={decrementBet}
              className="w-6 h-6 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-light"
              disabled={betAmount <= 10}
            >
              −
            </button>
            
            <div className="mx-3 text-center">
              <div className="text-2xl font-light text-white">
                {betAmount.toFixed(0)}
              </div>
            </div>
            
            <button
              onClick={incrementBet}
              className="w-6 h-6 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-light"
              disabled={betAmount >= (user?.balance || 0)}
            >
              +
            </button>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Right Side - Action Button */}
        <div className="flex-shrink-0">
          {currentBet?.active ? (
            gameState.isActive && !gameState.crashed ? (
              <button
                onClick={handleCashOut}
                disabled={!canCashOut}
                className={`font-bold py-8 px-8 rounded-xl text-lg ${
                  canCashOut
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div>Cash Out</div>
                <div className="text-base font-normal">
                  {(currentBet.amount * gameState.multiplier).toFixed(0)}
                </div>
              </button>
            ) : (
              <button
                onClick={handleCancel}
                disabled={!canCancel}
                className={`font-bold py-8 px-8 rounded-xl text-lg ${
                  canCancel
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div>{gameState.crashed ? 'Gone' : 'Cancel'}</div>
                <div className="text-base font-normal">
                  {currentBet.amount}
                </div>
              </button>
            )
          ) : (
            <button
              onClick={handleBet}
              disabled={!canBet && !canBetNextRound}
              className={`font-bold py-8 px-8 rounded-xl text-lg ${
                canBet || canBetNextRound
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div>
                {gameState.isActive && !currentBet?.active && !nextRoundBet ? 'Next' : 'Bet'}
              </div>
              <div className="text-base font-normal">
                {betAmount.toFixed(0)}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Auto Mode Controls */}
      {isAutoMode && (
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">Auto mode enabled</div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Auto Cash Out</span>
            <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="100"
                value={autoCashOut}
                onChange={(e) => setAutoCashOut(parseFloat(e.target.value) || 2.0)}
                className="bg-transparent text-white text-sm font-medium w-12 text-center focus:outline-none"
              />
              <span className="text-gray-400 text-sm ml-1">x</span>
            </div>
          </div>
        </div>
      )}

      {/* Current Bet Status */}
      {currentBet && gameState.isActive && (
        <div className="mt-4 text-center text-sm text-gray-400">
          Bet: {currentBet.amount} • Potential: {(currentBet.amount * gameState.multiplier).toFixed(0)}
        </div>
      )}

      {/* Next Round Bet */}
      {nextRoundBet && (
        <div className="mt-4 flex items-center justify-between text-sm text-yellow-400">
          <span>Next: {nextRoundBet.amount}</span>
          <button
            onClick={handleCancelNextRound}
            className="text-red-400 hover:text-red-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function BettingPanel() {
  return (
    <div className="space-y-4">
      {/* Two Betting Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SingleBettingPanel panelId="panel1" title="Bet 1" />
        <SingleBettingPanel panelId="panel2" title="Bet 2" />
      </div>
    </div>
  );
}

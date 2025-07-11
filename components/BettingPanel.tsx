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

  // Calculate available balance (total balance minus reserved balance)
  const availableBalance = user?.availableBalance ?? (user?.balance ?? 0) - (user?.reservedBalance ?? 0);

  const incrementBet = () => {
    setBetAmount(prev => Math.min(prev + 10, availableBalance));
  };

  const decrementBet = () => {
    setBetAmount(prev => Math.max(10, prev - 10));
  };

  const handleQuickAmount = (amount: number) => {
    setBetAmount(Math.min(amount, availableBalance));
  };

  // Auto cash out logic
  useEffect(() => {
    if (!user || !isAutoMode) return;

    if (currentBet?.active && gameState.isActive && gameState.multiplier >= autoCashOut) {
      cashOut();
    }
  }, [autoCashOut, gameState, currentBet, cashOut, isAutoMode]);

  const handleBet = () => {
    if (!user || betAmount <= 0 || betAmount > availableBalance) return;
    
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
      if (nextRoundBet.amount <= availableBalance) {
        placeBet(nextRoundBet.amount);
        setNextRoundBet(null);
      } else {
        setNextRoundBet(null);
      }
    }
  }, [gameState.bettingPhase, gameState.isActive, nextRoundBet, currentBet, availableBalance, placeBet]);

  const handleCancel = () => {
    if (currentBet && !gameState.isActive && gameState.bettingPhase) {
      cancelBet();
    } else if (nextRoundBet) {
      setNextRoundBet(null);
    }
  };

  const handleCashOut = () => {
    if (currentBet?.active && gameState.isActive && !gameState.crashed) {
      cashOut();
    }
  };

  const canBet = user && 
                 betAmount > 0 && 
                 betAmount <= availableBalance && 
                 availableBalance > 0 &&
                 !currentBet?.active && 
                 gameState.bettingPhase && 
                 !gameState.isActive;

  const canBetNextRound = user && 
                          betAmount > 0 && 
                          betAmount <= availableBalance && 
                          availableBalance > 0 &&
                          !currentBet?.active && 
                          gameState.isActive && 
                          !nextRoundBet;

  const canCancel = (currentBet?.active && 
                    gameState.bettingPhase && 
                    !gameState.isActive) || 
                   nextRoundBet !== null;

  const canCashOut = currentBet?.active && 
                     gameState.isActive && 
                     !gameState.crashed;

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl p-4 border border-gray-700/50 shadow-xl backdrop-blur-sm">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-gray-700/60 backdrop-blur-sm rounded-full p-1 w-28 border border-gray-600/30">
          <button
            onClick={() => setIsAutoMode(false)}
            className={`flex-1 py-1 px-2 rounded-full text-xs font-medium transition-all duration-200 ${
              !isAutoMode 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'text-gray-300 hover:text-white hover:bg-gray-600/30'
            }`}
          >
            Bet
          </button>
          <button
            onClick={() => setIsAutoMode(true)}
            className={`flex-1 py-1 px-2 rounded-full text-xs font-medium transition-all duration-200 ${
              isAutoMode 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-300 hover:text-white hover:bg-gray-600/30'
            }`}
          >
            Auto
          </button>
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center gap-3 mb-4">
        {/* Left Side - Bet Amount Controls */}
        <div className="flex-1">
          <div className="flex items-center justify-center mb-3">
            <button
              onClick={decrementBet}
              className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center text-xs font-light hover:from-red-400 hover:to-red-500 transition-all duration-200 shadow-md disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
              disabled={betAmount <= 10}
            >
              −
            </button>
            
            <div className="mx-2 text-center">
              <div className="text-xl font-light text-white bg-gray-700/30 px-3 py-1 rounded-lg border border-gray-600/30 shadow-inner">
                {betAmount.toFixed(0)}
              </div>
            </div>
            
            <button
              onClick={incrementBet}
              className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center text-xs font-light hover:from-green-400 hover:to-green-500 transition-all duration-200 shadow-md disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
              disabled={betAmount >= availableBalance}
            >
              +
            </button>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-2 gap-1">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                disabled={amount > availableBalance}
                className={`py-1 px-1 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  betAmount === amount
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25'
                    : amount > availableBalance
                    ? 'bg-gray-700/30 text-gray-500 border-gray-600/30 cursor-not-allowed'
                    : 'bg-gray-700/50 text-gray-200 border-gray-600/30 hover:bg-gray-600/50 hover:border-gray-500/50 hover:text-white'
                }`}
              >
                {amount >= 1000 ? `${amount/1000}k` : amount}
              </button>
            ))}
          </div>

          {/* Available Balance Info */}
          {availableBalance <= 0 && user && (
            <div className="mt-2 p-2 bg-red-900/30 border border-red-600/50 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="text-red-400">⚠️</span>
                <span className="text-xs text-red-300">
                  No available balance for betting
                </span>
              </div>
              {user.reservedBalance && user.reservedBalance > 0 && (
                <div className="text-xs text-red-400 mt-1">
                  {user.reservedBalance.toLocaleString()} coins reserved for withdrawal
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Action Button */}
        <div className="flex-shrink-0">
          {currentBet?.active ? (
            gameState.isActive && !gameState.crashed ? (
              <button
                onClick={handleCashOut}
                disabled={!canCashOut}
                className={`font-bold py-6 px-14 rounded-xl text-base transition-all duration-200 border-2 ${
                  canCashOut
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-600'
                }`}
              >
                <div>Cash Out</div>
                <div className="text-sm font-normal">
                  {(currentBet.amount * gameState.multiplier).toFixed(0)}
                </div>
              </button>
            ) : (
              <button
                onClick={handleCancel}
                disabled={!canCancel}
                className={`font-bold py-6 px-14 rounded-xl text-base transition-all duration-200 border-2 ${
                  canCancel
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-600'
                }`}
              >
                <div>Cancel</div>
                <div className="text-sm font-normal">
                  {nextRoundBet ? nextRoundBet.amount : currentBet?.amount}
                </div>
              </button>
            )
          ) : nextRoundBet ? (
            <button
              onClick={handleCancel}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 font-bold py-5 px-14 rounded-xl text-base transition-all duration-200 border-2"
            >
              <div>Cancel</div>
              <div className="text-sm font-normal">
                {nextRoundBet.amount}
              </div>
              <div className="text-xs text-red-200">
                Waiting for next round
              </div>
            </button>
          ) : (
            <button
              onClick={handleBet}
              disabled={!canBet && !canBetNextRound}
              className={`font-bold py-6 px-14 rounded-xl text-base transition-all duration-200 border-2 ${
                canBet || canBetNextRound
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-600'
              }`}
              title={
                !user ? 'Please log in to bet' :
                availableBalance <= 0 ? 'No available balance for betting' :
                betAmount > availableBalance ? `Insufficient balance. Available: ${availableBalance} coins` :
                betAmount <= 0 ? 'Please enter a valid bet amount' :
                'Place your bet'
              }
            >
              <div>Bet</div>
              <div className="text-sm font-normal">
                {betAmount.toFixed(0)}
              </div>
              {availableBalance <= 0 && user && (
                <div className="text-xs text-red-300">
                  No balance
                </div>
              )}
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
        <div className="mt-4 text-center text-sm text-yellow-400">
          Waiting for next round: {nextRoundBet.amount}
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

// crashGameEngine.js

class GameEngine {
  constructor(io) {
    this.io = io;
    this.gameState = {
      isActive: false,
      multiplier: 1.00,
      crashed: false,
      roundId: null,
      bettingPhase: true,
      timeRemaining: 5000,
    };

    this.activeBets = new Map();
    this.crashPoint = null;
    this.gameInterval = null;
    this.bettingInterval = null;
    this.manualCrashPoint = null;
    this.recentWinners = [];
    this.history = [];

    this.startBettingPhase();
  }

  generateCrashPoint() {
    if (this.manualCrashPoint) {
      const point = this.manualCrashPoint;
      this.manualCrashPoint = null;
      return point;
    }

    const rand = Math.random();
    const edge = 0.03;
    const crash = Math.floor(100 / ((1 - rand) * (1 + edge))) / 100;
    return Math.min(Math.max(1.01, crash), 100.0);
  }

  startBettingPhase() {
    this.gameState = {
      isActive: false,
      multiplier: 1.00,
      crashed: false,
      roundId: `round_${Date.now()}`,
      bettingPhase: true,
      timeRemaining: 5000,
    };

    this.activeBets.clear();
    this.crashPoint = this.generateCrashPoint();
    this.io.emit('game-state', this.gameState);

    this.bettingInterval = setInterval(() => {
      this.gameState.timeRemaining -= 100;
      this.io.emit('game-state', this.gameState);
      if (this.gameState.timeRemaining <= 0) {
        this.startGame();
      }
    }, 100);
  }

  startGame() {
    if (this.bettingInterval) clearInterval(this.bettingInterval);
    this.bettingInterval = null;

    this.gameState = {
      ...this.gameState,
      isActive: true,
      bettingPhase: false,
      multiplier: 1.00,
    };

    this.io.emit('game-state', this.gameState);

    this.gameInterval = setInterval(() => {
      this.gameState.multiplier += 0.02;
      this.io.emit('multiplier-update', this.gameState.multiplier);

      this.activeBets.forEach((bet, userId) => {
        if (bet.autoCashOut && bet.active && this.gameState.multiplier >= bet.autoCashOut) {
          this.cashOut(userId);
        }
      });

      if (this.gameState.multiplier >= this.crashPoint) {
        this.crashGame();
      }
    }, 50);
  }

  crashGame() {
    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = null;

    this.gameState.crashed = true;
    this.gameState.isActive = false;

    this.io.emit('game-crashed', this.crashPoint);
    this.io.emit('round-ended', {
      roundId: this.gameState.roundId,
      crashPoint: this.crashPoint,
    });

    this.activeBets.forEach((bet, userId) => {
      if (bet.active) {
        console.log(`User ${userId} lost bet of ${bet.amount}`);
      }
    });

    this.history.unshift({
      roundId: this.gameState.roundId,
      crashPoint: this.crashPoint,
    });
    this.history = this.history.slice(0, 20);
    this.io.emit('history-update', this.history);

    setTimeout(() => {
      this.startBettingPhase();
    }, 3000);
  }

  placeBet(userId, amount, socketId, autoCashOut = null) {
    if (!this.gameState.bettingPhase || this.gameState.isActive) {
      return { success: false, message: 'Betting is closed' };
    }

    if (this.activeBets.has(userId)) {
      return { success: false, message: 'Already placed a bet this round' };
    }

    this.activeBets.set(userId, {
      amount,
      socketId,
      active: true,
      multiplier: null,
      autoCashOut,
    });

    return { success: true };
  }

  cashOut(userId) {
    const bet = this.activeBets.get(userId);
    if (!bet || !bet.active || !this.gameState.isActive) {
      return { success: false, message: 'No active bet to cash out' };
    }

    const payout = Math.floor(bet.amount * this.gameState.multiplier);
    bet.active = false;
    bet.multiplier = this.gameState.multiplier;
    this.activeBets.set(userId, bet);

    this.recentWinners.push({
      userId,
      amount: bet.amount,
      payout,
      multiplier: bet.multiplier,
    });

    this.io.to(bet.socketId).emit('cashed-out', {
      payout,
      multiplier: bet.multiplier,
    });

    return {
      success: true,
      payout,
      multiplier: this.gameState.multiplier,
    };
  }

  // Admin controls
  adminStartRound() {
    if (this.bettingInterval) clearInterval(this.bettingInterval);
    this.startGame();
  }

  adminPauseRound() {
    if (this.gameInterval) clearInterval(this.gameInterval);
    if (this.bettingInterval) clearInterval(this.bettingInterval);
    this.gameState.isActive = false;
    this.gameState.bettingPhase = false;
    this.io.emit('game-state', this.gameState);
  }

  adminSetCrash(crashPoint) {
    this.manualCrashPoint = crashPoint;
  }
}

module.exports = GameEngine;

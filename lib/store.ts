import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { hapticFeedback } from './mobile';
import { playSound } from './sounds';

interface User {
  id: string;
  email: string;
  balance: number;
  reservedBalance?: number;
  availableBalance?: number;
  isAdmin?: boolean;
}

interface GameState {
  isActive: boolean;
  multiplier: number;
  crashed: boolean;
  crashPoint?: number;
  roundId: string | null;
  timeRemaining: number;
  bettingPhase: boolean;
}

interface Bet {
  id: string;
  amount: number;
  multiplier?: number;
  payout?: number;
  cashedOut: boolean;
  roundId: string;
  timestamp: Date;
}

interface Store {
  // Auth
  user: User | null;
  token: string | null;
  
  // Game
  gameState: GameState;
  currentBet: { amount: number; active: boolean } | null;
  betHistory: Bet[];
  
  // Socket
  socket: Socket | null;
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  
  // Game actions
  setGameState: (state: Partial<GameState>) => void;
  placeBet: (amount: number) => void;
  cancelBet: () => void;
  cashOut: () => void;
  addBetToHistory: (bet: Bet) => void;
  
  // Socket actions
  initSocket: () => void;
  disconnectSocket: () => void;
}

export const useStore = create<Store>((set, get) => ({
  // Initial state
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  gameState: {
    isActive: false,
    multiplier: 0.00,
    crashed: false,
    roundId: null,
    timeRemaining: 0,
    bettingPhase: true,
  },
  currentBet: null,
  betHistory: [],
  socket: null,

  // Auth actions
  setUser: (user) => set({ user }),
  setToken: (token) => {
    set({ token });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  logout: () => {
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    get().disconnectSocket();
  },

  // Game actions
  setGameState: (state) => 
    set((prev) => ({ 
      gameState: { ...prev.gameState, ...state } 
    })),

  placeBet: (amount) => {
    const { user, socket } = get();
    const availableBalance = user?.availableBalance ?? user?.balance ?? 0;
    if (!user || !socket || availableBalance < amount) return;
    
    hapticFeedback.bet();
    playSound.bet();
    
    // Optimistically deduct from balance for UI responsiveness
    // Calculate new available balance considering reserved amount
    const newBalance = user.balance - amount;
    const newAvailableBalance = newBalance - (user.reservedBalance || 0);
    
    set({ 
      currentBet: { amount, active: true },
      user: { 
        ...user, 
        balance: newBalance,
        availableBalance: newAvailableBalance
      }
    });
    
    socket.emit('place-bet', { amount });
  },

  cashOut: () => {
    const { socket, currentBet } = get();
    if (!socket || !currentBet?.active) return;
    
    hapticFeedback.cashOut();
    playSound.cashOut();
    socket.emit('cash-out');
    set({ currentBet: { ...currentBet, active: false } });
  },

  cancelBet: async () => {
    const { currentBet, user, socket, token } = get();
    if (!currentBet || !user || !socket || !token || get().gameState.isActive) {
      console.warn('Cannot cancel bet: invalid conditions');
      return;
    }

    try {
      hapticFeedback.light();
      
      // Optimistically restore balance for immediate UI feedback
      const restoredBalance = user.balance + currentBet.amount;
      const restoredAvailableBalance = restoredBalance - (user.reservedBalance || 0);
      
      set({ 
        currentBet: null,
        user: {
          ...user,
          balance: restoredBalance,
          availableBalance: restoredAvailableBalance
        }
      });
      
      // Notify server - server response will sync the final balance state
      socket.emit('bet-cancelled', {
        userId: user.id,
        amount: currentBet.amount,
        roundId: get().gameState.roundId
      });
    } catch (error) {
      console.error('Error cancelling bet:', error);
    }
  },

  addBetToHistory: (bet) =>
    set((prev) => ({ 
      betHistory: [bet, ...prev.betHistory.slice(0, 49)] // Keep last 50 bets
    })),

  // Socket actions
  initSocket: () => {
    const { token } = get();
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aviator-game-lzz1.onrender.com', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('game-state', (state: GameState) => {
      set((prev) => ({ gameState: { ...prev.gameState, ...state } }));
    });

    socket.on('multiplier-update', (multiplier: number) => {
      set((prev) => ({ 
        gameState: { ...prev.gameState, multiplier }
      }));
    });

    socket.on('game-crashed', (crashPoint: number) => {
      hapticFeedback.error();
      playSound.flightCrash(); // Plane flying away sound
      const { currentBet } = get();
      set((prev) => ({ 
        gameState: { 
          ...prev.gameState, 
          crashed: true, 
          crashPoint,
          isActive: false 
        }
      }));
      
      if (currentBet?.active) {
        // Player lost their bet
        const bet: Bet = {
          id: `${Date.now()}`,
          amount: currentBet.amount,
          multiplier: 0,
          payout: 0,
          cashedOut: false,
          roundId: get().gameState.roundId || '',
          timestamp: new Date()
        };
        
        set((prev) => ({
          currentBet: null,
          betHistory: [bet, ...prev.betHistory.slice(0, 49)]
        }));
      }
    });

    socket.on('bet-placed', (data: { newBalance: number }) => {
      // Server confirms bet placement - sync balance with authoritative source
      const { user } = get();
      if (user) {
        const newAvailableBalance = data.newBalance - (user.reservedBalance || 0);
        set((prev) => ({ 
          user: prev.user ? { 
            ...prev.user, 
            balance: data.newBalance,
            availableBalance: newAvailableBalance
          } as User : null
        }));
      }
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
      // Server rejected bet or other error - restore optimistically deducted balance
      const { user, currentBet } = get();
      if (user && currentBet) {
        const restoredBalance = user.balance + currentBet.amount;
        const restoredAvailableBalance = restoredBalance - (user.reservedBalance || 0);
        set({ 
          currentBet: null,
          user: {
            ...user,
            balance: restoredBalance,
            availableBalance: restoredAvailableBalance
          }
        });
      }
    });

    socket.on('cash-out-success', (data: { payout: number; multiplier: number; newBalance: number }) => {
      hapticFeedback.success();
      const { user, currentBet } = get();
      if (user && currentBet) {
        console.log('Cash out success - updating balance:', data.newBalance);
        
        // Calculate new available balance
        const newAvailableBalance = data.newBalance - (user.reservedBalance || 0);
        
        // Add successful bet to history
        const bet: Bet = {
          id: `${Date.now()}`,
          amount: currentBet.amount,
          multiplier: data.multiplier,
          payout: data.payout,
          cashedOut: true,
          roundId: get().gameState.roundId || '',
          timestamp: new Date()
        };
        
        set((prev) => ({
          user: { 
            ...user, 
            balance: data.newBalance,
            availableBalance: newAvailableBalance
          } as User,
          currentBet: null,
          betHistory: [bet, ...prev.betHistory.slice(0, 49)]
        }));
      }
    });

    // Real-time transaction updates
    socket.on('transaction-update', (data: { 
      userId: string; 
      transactionId: string; 
      status: string; 
      newBalance: number; 
      transaction: any 
    }) => {
      const { user } = get();
      if (user && data.userId === user.id) {
        const newAvailableBalance = data.newBalance - (user.reservedBalance || 0);
        set((prev) => ({
          user: prev.user ? {
            ...prev.user,
            balance: data.newBalance,
            availableBalance: newAvailableBalance
          } as User : null
        }));
      }
    });

    // Real-time balance updates
    socket.on('balance-update', (data: { 
      userId: string; 
      newBalance: number;
      availableBalance?: number;
      reservedBalance?: number;
    }) => {
      const { user } = get();
      if (user && data.userId === user.id) {
        console.log('Balance update received:', data);
        set((prev) => ({
          user: prev.user ? {
            ...prev.user,
            balance: data.newBalance,
            availableBalance: data.availableBalance ?? (data.newBalance - (data.reservedBalance || 0)),
            reservedBalance: data.reservedBalance ?? prev.user.reservedBalance
          } as User : null
        }));
      }
    });

    socket.on('round-ended', (data: { roundId: string; crashPoint: number }) => {
      console.log('Round ended:', data);
    });

    socket.on('bet-cancelled-success', (data: { 
      newBalance: number; 
      availableBalance?: number; 
      reservedBalance?: number; 
    }) => {
      const { user } = get();
      if (user) {
        console.log('Bet cancelled, restoring balance:', data);
        set((prev) => ({
          user: prev.user ? {
            ...prev.user,
            balance: data.newBalance,
            availableBalance: data.availableBalance ?? (data.newBalance - (data.reservedBalance || 0)),
            reservedBalance: data.reservedBalance ?? prev.user.reservedBalance
          } as User : null,
          currentBet: null
        }));
      }
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

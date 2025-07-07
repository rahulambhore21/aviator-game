import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { hapticFeedback } from './mobile';
import { playSound } from './sounds';

interface User {
  id: string;
  email: string;
  balance: number;
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
    if (!user || !socket || user.balance < amount) return;
    
    hapticFeedback.bet();
    playSound.bet();
    set({ currentBet: { amount, active: true } });
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
      
      // Return bet amount to user balance
      set({ 
        currentBet: null,
        user: { ...user, balance: user.balance + currentBet.amount }
      });
      
      // Notify server
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

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002', {
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
        // User lost the bet
        set({ currentBet: null });
      }
    });

    socket.on('bet-placed', (data: { newBalance: number }) => {
      set((prev) => ({ 
        user: prev.user ? { ...prev.user, balance: data.newBalance } as User : null
      }));
    });

    socket.on('cash-out-success', (data: { payout: number; multiplier: number; newBalance: number }) => {
      hapticFeedback.success();
      const { currentBet } = get();
      if (currentBet) {
        get().addBetToHistory({
          id: Date.now().toString(),
          amount: currentBet.amount,
          multiplier: data.multiplier,
          payout: data.payout,
          cashedOut: true,
          roundId: get().gameState.roundId || '',
          timestamp: new Date(),
        });
      }
      
      set({ 
        currentBet: null,
        user: get().user ? { 
          ...get().user, 
          balance: data.newBalance 
        } as User : null
      });
    });

    socket.on('round-ended', (data: { roundId: string; crashPoint: number }) => {
      const { currentBet } = get();
      if (currentBet?.active) {
        // User lost the bet
        get().addBetToHistory({
          id: Date.now().toString(),
          amount: currentBet.amount,
          payout: 0,
          cashedOut: false,
          roundId: data.roundId,
          timestamp: new Date(),
        });
        set({ currentBet: null });
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

import { create } from 'zustand';
import { authAPI } from './api';

// Create dedicated admin axios instance
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aviator-game-lzz1.onrender.com';

const adminAPIInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Admin API interceptor - only uses admin token
adminAPIInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  }
  return config;
});

// Admin-specific API functions
const adminAPI = {
  getStats: async () => {
    const response = await adminAPIInstance.get('/admin/stats');
    return response.data;
  },
  getUsers: async (params = {}) => {
    const response = await adminAPIInstance.get('/admin/users', { params });
    return response.data;
  },
  getUser: async (userId: string) => {
    const response = await adminAPIInstance.get(`/admin/users/${userId}`);
    return response.data;
  },
  updateUserBalance: async (userId: string, amount: number, action: 'credit' | 'debit', reason: string) => {
    const response = await adminAPIInstance.post(`/admin/users/${userId}/balance`, { amount, action, reason });
    return response.data;
  },
  updateUserStatus: async (userId: string, status: 'active' | 'frozen' | 'suspended', reason: string) => {
    const response = await adminAPIInstance.post(`/admin/users/${userId}/status`, { status, reason });
    return response.data;
  },
  getTransactions: async (params = {}) => {
    const response = await adminAPIInstance.get('/admin/transactions', { params });
    return response.data;
  },
  processTransaction: async (transactionId: string, action: 'approve' | 'reject', notes: string) => {
    const response = await adminAPIInstance.post(`/admin/transactions/${transactionId}/process`, { action, notes });
    return response.data;
  },
  setCrashPoint: async (crashPoint: number) => {
    const response = await adminAPIInstance.post('/admin/game/crash', { crashPoint });
    return response.data;
  },
  pauseGame: async () => {
    const response = await adminAPIInstance.post('/admin/game/pause');
    return response.data;
  },
  resumeGame: async () => {
    const response = await adminAPIInstance.post('/admin/game/resume');
    return response.data;
  },
  getAnalytics: async (days = 7) => {
    const response = await adminAPIInstance.get('/admin/analytics', { params: { days } });
    return response.data;
  },
  getLogs: async (params = {}) => {
    const response = await adminAPIInstance.get('/admin/logs', { params });
    return response.data;
  },
};

interface User {
  _id: string;
  email: string;
  balance: number;
  accountStatus: 'active' | 'frozen' | 'suspended';
  isAdmin: boolean;
  totalBets: number;
  totalWinnings: number;
  createdAt: string;
  lastActive: string;
}

interface Transaction {
  _id: string;
  user: { email: string } | null;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod?: string;
  adminNotes?: string;
  processedBy?: { email: string } | null;
  processedAt?: string;
  reference?: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalBets: number;
  totalVolume: number;
  totalPayout: number;
  profit: number;
  pendingTransactions: number;
  currentRound?: {
    id: string;
    isActive: boolean;
    betsCount: number;
    totalVolume: number;
  };
}

interface AdminLog {
  _id: string;
  admin: { email: string };
  action: string;
  targetUser?: { email: string };
  details: any;
  ipAddress?: string;
  createdAt: string;
}

interface AdminStore {
  // State
  isAuthenticated: boolean;
  token: string | null;
  adminUser: any | null;
  stats: AdminStats | null;
  users: User[];
  transactions: Transaction[];
  logs: AdminLog[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  
  // Pagination
  usersPagination: { current: number; pages: number; total: number };
  transactionsPagination: { current: number; pages: number; total: number };
  logsPagination: { current: number; pages: number; total: number };
  
  // Actions
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;
  
  // Dashboard
  fetchStats: () => Promise<void>;
  
  // User management
  fetchUsers: (params?: any) => Promise<void>;
  fetchUser: (userId: string) => Promise<void>;
  updateUserBalance: (userId: string, amount: number, action: 'credit' | 'debit', reason: string) => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'frozen' | 'suspended', reason: string) => Promise<void>;
  
  // Transaction management
  fetchTransactions: (params?: any) => Promise<void>;
  processTransaction: (transactionId: string, action: 'approve' | 'reject', notes: string) => Promise<void>;
  
  // Game controls
  setCrashPoint: (crashPoint: number) => Promise<void>;
  pauseGame: () => Promise<void>;
  resumeGame: () => Promise<void>;
  
  // Logs
  fetchLogs: (params?: any) => Promise<void>;
  
  // Utility
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('adminToken') : false,
  token: typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null,
  adminUser: null,
  stats: null,
  users: [],
  transactions: [],
  logs: [],
  selectedUser: null,
  loading: false,
  error: null,
  usersPagination: { current: 1, pages: 1, total: 0 },
  transactionsPagination: { current: 1, pages: 1, total: 0 },
  logsPagination: { current: 1, pages: 1, total: 0 },

  // Auth actions
  login: async (password: string) => {
    try {
      set({ loading: true, error: null });
      
      const response = await authAPI.adminLogin(password);
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminToken', response.token);
      }
      
      set({ 
        isAuthenticated: true, 
        token: response.token,
        adminUser: response.user,
        loading: false 
      });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Invalid admin password', loading: false });
      return false;
    }
  },

  logout: () => {
    // Remove token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
    
    set({
      isAuthenticated: false,
      token: null,
      adminUser: null,
      stats: null,
      users: [],
      transactions: [],
      logs: [],
      selectedUser: null,
      error: null
    });
  },

  // Initialize admin authentication on app start
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        set({ isAuthenticated: true, token });
      }
    }
  },

  // Dashboard
  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await adminAPI.getStats();
      set({ stats, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch stats', loading: false });
    }
  },

  // User management
  fetchUsers: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await adminAPI.getUsers(params);
      set({ 
        users: response.users, 
        usersPagination: response.pagination,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch users', loading: false });
    }
  },

  fetchUser: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await adminAPI.getUser(userId);
      set({ selectedUser: response.user, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch user', loading: false });
    }
  },

  updateUserBalance: async (userId: string, amount: number, action: 'credit' | 'debit', reason: string) => {
    try {
      set({ loading: true, error: null });
      await adminAPI.updateUserBalance(userId, amount, action, reason);
      
      // Refresh users and selected user
      const currentPage = get().usersPagination.current;
      await get().fetchUsers({ page: currentPage });
      if (get().selectedUser?._id === userId) {
        await get().fetchUser(userId);
      }
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update balance', loading: false });
    }
  },

  updateUserStatus: async (userId: string, status: 'active' | 'frozen' | 'suspended', reason: string) => {
    try {
      set({ loading: true, error: null });
      await adminAPI.updateUserStatus(userId, status, reason);
      
      // Refresh users and selected user
      const currentPage = get().usersPagination.current;
      await get().fetchUsers({ page: currentPage });
      if (get().selectedUser?._id === userId) {
        await get().fetchUser(userId);
      }
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update status', loading: false });
    }
  },

  // Transaction management
  fetchTransactions: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await adminAPI.getTransactions(params);
      set({ 
        transactions: response.transactions, 
        transactionsPagination: response.pagination,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch transactions', loading: false });
    }
  },

  processTransaction: async (transactionId: string, action: 'approve' | 'reject', notes: string) => {
    try {
      set({ loading: true, error: null });
      await adminAPI.processTransaction(transactionId, action, notes);
      
      // Refresh transactions
      const currentPage = get().transactionsPagination.current;
      await get().fetchTransactions({ page: currentPage });
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to process transaction', loading: false });
    }
  },

  // Game controls
  setCrashPoint: async (crashPoint: number) => {
    try {
      set({ loading: true, error: null });
      await adminAPI.setCrashPoint(crashPoint);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to set crash point', loading: false });
    }
  },

  pauseGame: async () => {
    try {
      set({ loading: true, error: null });
      await adminAPI.pauseGame();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to pause game', loading: false });
    }
  },

  resumeGame: async () => {
    try {
      set({ loading: true, error: null });
      await adminAPI.resumeGame();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to resume game', loading: false });
    }
  },

  // Logs
  fetchLogs: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await adminAPI.getLogs(params);
      set({ 
        logs: response.logs, 
        logsPagination: response.pagination,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch logs', loading: false });
    }
  },

  // Utility
  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ loading }),
}));

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aviator-game-lzz1.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // For wallet routes, prioritize user token over admin token
    if (config.url?.includes('/wallet/')) {
      const userToken = localStorage.getItem('token');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
        return config;
      }
    }
    
    // For admin routes, prioritize admin token
    if (config.url?.includes('/admin/')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        return config;
      }
    }
    
    // For general routes, use admin token first, then user token
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');
    
    const token = adminToken || userToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    balance: number;
  };
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  adminLogin: async (password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/admin-login', { password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const gameAPI = {
  getBetHistory: async () => {
    const response = await api.get('/game/history');
    return response.data;
  },

  getGameStats: async () => {
    const response = await api.get('/game/stats');
    return response.data;
  },
};

export const adminAPI = {
  // Dashboard stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // User management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserBalance: async (userId: string, amount: number, action: 'credit' | 'debit', reason: string) => {
    const response = await api.post(`/admin/users/${userId}/balance`, { amount, action, reason });
    return response.data;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'frozen' | 'suspended', reason: string) => {
    const response = await api.post(`/admin/users/${userId}/status`, { status, reason });
    return response.data;
  },

  // Transaction management
  getTransactions: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },

  processTransaction: async (transactionId: string, action: 'approve' | 'reject', notes: string) => {
    const response = await api.post(`/admin/transactions/${transactionId}/process`, { action, notes });
    return response.data;
  },

  // Game engine controls
  setCrashPoint: async (crashPoint: number) => {
    const response = await api.post('/admin/game/crash-point', { crashPoint });
    return response.data;
  },

  pauseGame: async () => {
    const response = await api.post('/admin/game/pause');
    return response.data;
  },

  resumeGame: async () => {
    const response = await api.post('/admin/game/resume');
    return response.data;
  },

  // Analytics
  getAnalytics: async (days = 7) => {
    const response = await api.get(`/admin/analytics/overview?days=${days}`);
    return response.data;
  },

  // Admin logs
  getLogs: async (params = {}) => {
    const response = await api.get('/admin/logs', { params });
    return response.data;
  },
};

export const walletAPI = {
  getHistory: async (params = {}) => {
    const response = await api.get('/wallet/history', { params });
    return response.data;
  },

  requestDeposit: async (amount: number, paymentMethod: string) => {
    const response = await api.post('/wallet/deposit', { amount, paymentMethod });
    return response.data;
  },

  requestWithdrawal: async (amount: number, paymentMethod: string) => {
    const response = await api.post('/wallet/withdrawal', { amount, paymentMethod });
    return response.data;
  },

  getPending: async () => {
    const response = await api.get('/wallet/pending');
    return response.data;
  },
};

export default api;

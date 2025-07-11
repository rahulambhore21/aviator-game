import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aviator-game-lzz1.onrender.com';

// Create separate axios instances for user and admin
export const userAPI = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const adminAPI = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// User API interceptor - only uses user token
userAPI.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userToken = localStorage.getItem('token');
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }
  return config;
});

// Admin API interceptor - only uses admin token
adminAPI.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  }
  return config;
});

// User wallet API
export const userWalletAPI = {
  getHistory: async (params = {}) => {
    const response = await userAPI.get('/wallet/history', { params });
    return response.data;
  },

  requestDeposit: async (amount: number, paymentMethod: string) => {
    const response = await userAPI.post('/wallet/deposit', { amount, paymentMethod });
    return response.data;
  },

  requestWithdrawal: async (amount: number, paymentMethod: string) => {
    const response = await userAPI.post('/wallet/withdrawal', { amount, paymentMethod });
    return response.data;
  },

  getPending: async () => {
    const response = await userAPI.get('/wallet/pending');
    return response.data;
  },
};

// User auth API
export const userAuthAPI = {
  register: async (data: { email: string; password: string }) => {
    const response = await userAPI.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await userAPI.post('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await userAPI.get('/auth/profile');
    return response.data;
  },
};

// User game API
export const userGameAPI = {
  getBetHistory: async () => {
    const response = await userAPI.get('/game/history');
    return response.data;
  },

  getGameStats: async () => {
    const response = await userAPI.get('/game/stats');
    return response.data;
  },
};

export default userAPI;

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aviator-game-lzz1.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
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
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getRounds: async () => {
    const response = await api.get('/admin/rounds');
    return response.data;
  },

  controlGame: async (action: 'start' | 'pause' | 'stop') => {
    const response = await api.post('/admin/control', { action });
    return response.data;
  },

  setCrashPoint: async (crashPoint: number) => {
    const response = await api.post('/admin/set-crash', { crashPoint });
    return response.data;
  },
};

export default api;

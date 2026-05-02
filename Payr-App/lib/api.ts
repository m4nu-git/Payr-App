import axios from 'axios';
import { BASE_URL } from './constants';
import type {
  AuthResponse,
  HistoryParams,
  HistoryResponse,
  SearchUser,
  SignInPayload,
  SignUpPayload,
  TransferPayload,
  TransferResponse,
  UpdateUserPayload,
  User,
} from '../types';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from authStore on every request
api.interceptors.request.use((config) => {
  // Lazy import to avoid circular dependency at module init time
  const { useAuthStore } = require('../store/authStore');
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear auth and redirect to sign-in
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = require('../store/authStore');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export function signup(payload: SignUpPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/user/signup', payload).then((r) => r.data);
}

export function signin(payload: SignInPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/user/signin', payload).then((r) => r.data);
}

export function updateUser(payload: UpdateUserPayload): Promise<{ message: string; user: User }> {
  return api.put<{ message: string; user: User }>('/user/', payload).then((r) => r.data);
}

export function searchUsers(filter: string): Promise<SearchUser[]> {
  return api
    .get<{ users: SearchUser[] }>('/user/bulk', { params: { filter } })
    .then((r) => r.data.users);
}

export function getBalance(): Promise<number> {
  return api.get<{ balance: number }>('/account/balance').then((r) => r.data.balance);
}

export function transferMoney(payload: TransferPayload): Promise<TransferResponse> {
  return api.post<TransferResponse>('/account/transfer', payload).then((r) => r.data);
}

export function getHistory(params: HistoryParams): Promise<HistoryResponse> {
  return api.get<HistoryResponse>('/account/history', { params }).then((r) => r.data);
}

export default api;

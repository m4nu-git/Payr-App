export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Counterparty {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  note: string;
  status: 'success' | 'failed';
  createdAt: string;
  counterparty: Counterparty;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SignUpPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInPayload {
  username: string;
  password: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface TransferPayload {
  to: string;
  amount: number;
  note?: string;
}

export interface TransferResponse {
  message: string;
  newBalance: number;
  transferredTo: string;
  amount: number;
  transactionId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HistoryParams {
  type?: 'all' | 'sent' | 'received';
  page?: number;
  limit?: number;
}

export interface HistoryResponse {
  transactions: Transaction[];
  pagination: Pagination;
}

export interface SearchUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

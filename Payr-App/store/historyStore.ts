import { create } from 'zustand';
import { Pagination, Transaction } from '../types';
import { getHistory } from '../lib/api';


type FilterType = 'all' | 'sent' | 'received';

interface HistoryState {
  transactions: Transaction[];
  pagination: Pagination | null;
  filter: FilterType;
  page: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

interface HistoryActions {
  setFilter: (filter: FilterType) => void;
  fetchHistory: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState & HistoryActions>()((set, get) => ({
  transactions: [],
  pagination: null,
  filter: 'all',
  page: 1,
  loading: false,
  loadingMore: false,
  error: null,

  setFilter: (filter) => {
    set({ filter, page: 1, transactions: [], pagination: null });
    get().fetchHistory();
  },

  fetchHistory: async () => {
    const { filter } = get();
    set({ loading: true, error: null });
    try {
      const data = await getHistory({ type: filter, page: 1, limit: 10 });
      set({
        transactions: data.transactions,
        pagination: data.pagination,
        page: 1,
        loading: false,
      });
    } catch {
      set({ error: 'Failed to load transactions', loading: false });
    }
  },

  loadMore: async () => {
    const { loading, loadingMore, pagination, filter, page, transactions } = get();
    if (loading || loadingMore || !pagination?.hasNext) return;

    const nextPage = page + 1;
    set({ loadingMore: true });
    try {
      const data = await getHistory({ type: filter, page: nextPage, limit: 10 });
      set({
        transactions: [...transactions, ...data.transactions],
        pagination: data.pagination,
        page: nextPage,
        loadingMore: false,
      });
    } catch {
      set({ loadingMore: false });
    }
  },
}));

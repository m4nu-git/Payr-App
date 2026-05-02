import { create } from 'zustand';
import { getBalance } from '../lib/api';


interface AccountState {
  balance: number | null;
  loading: boolean;
  error: string | null;
}

interface AccountActions {
  fetchBalance: () => Promise<void>;
}

export const useAccountStore = create<AccountState & AccountActions>()((set) => ({
  balance: null,
  loading: false,
  error: null,

  fetchBalance: async () => {
    set({ loading: true, error: null });
    try {
      const balance = await getBalance();
      set({ balance, loading: false });
    } catch {
      set({ error: 'Failed to fetch balance', loading: false });
    }
  },
}));

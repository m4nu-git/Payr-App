import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { User } from '../types';
import { STORAGE_KEYS } from '../lib/constants';


interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
}

interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false,

      login: (token, user) => {
        set({ token, user });
      },

      logout: () => {
        set({ token: null, user: null });
        router.replace('/(auth)/sign-in');
      },

      hydrate: async () => {
        // persist middleware already rehydrates from AsyncStorage automatically.
        // We just need to mark hydration complete after the store is ready.
        set({ isHydrated: true });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist token and user; isHydrated is always false on fresh load
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);

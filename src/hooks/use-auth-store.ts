import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  shopName: string | null;
  pin: string | null;
  isLoggedIn: boolean;
  initialized: boolean;
  setup: (shopName: string, pin: string) => void;
  login: () => void;
  logout: () => void;
  reset: () => void;
}

const useAuthStoreUnpersisted = create<AuthState>((set) => ({
    shopName: null,
    pin: null,
    isLoggedIn: false,
    initialized: false,
    setup: (shopName, pin) => set({ shopName, pin }),
    login: () => set({ isLoggedIn: true }),
    logout: () => set({ isLoggedIn: false }),
    reset: () => set({ shopName: null, pin: null, isLoggedIn: false, initialized: true }),
}));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...useAuthStoreUnpersisted.getState(),
      setup: (shopName: string, pin: string) => {
        set({ shopName, pin, initialized: true });
      },
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
      reset: () => set({ shopName: null, pin: null, isLoggedIn: false, initialized: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrate: () => {
         useAuthStore.setState({ initialized: true });
      }
    }
  )
);

// This ensures that the store is initialized on the client side
if (typeof window !== 'undefined') {
    useAuthStore.getState();
}

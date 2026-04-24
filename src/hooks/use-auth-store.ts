import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  shopName: string | null;
  pin: string | null;
  isLoggedIn: boolean;
  initialized: boolean;
  biometricEnabled: boolean;
  setup: (shopName: string, pin: string) => void;
  login: () => void;
  logout: () => void;
  reset: () => void;
  toggleBiometric: () => void;
  changePin: (oldPin: string, newPin: string) => boolean;
}

const useAuthStoreUnpersisted = create<AuthState>((set, get) => ({
    shopName: null,
    pin: null,
    isLoggedIn: false,
    initialized: false,
    biometricEnabled: false,
    setup: (shopName, pin) => set({ shopName, pin, biometricEnabled: false }),
    login: () => set({ isLoggedIn: true }),
    logout: () => set({ isLoggedIn: false }),
    reset: () => set({ shopName: null, pin: null, isLoggedIn: false, initialized: true, biometricEnabled: false }),
    toggleBiometric: () => set((state) => ({ biometricEnabled: !state.biometricEnabled })),
    changePin: (oldPin: string, newPin: string) => {
        const { pin } = get();
        if (pin === oldPin) {
            set({ pin: newPin });
            return true;
        }
        return false;
    }
}));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...useAuthStoreUnpersisted.getState(),
      setup: (shopName: string, pin: string) => {
        set({ shopName, pin, initialized: true, biometricEnabled: false });
      },
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
      reset: () => set({ shopName: null, pin: null, isLoggedIn: false, initialized: true, biometricEnabled: false }),
      toggleBiometric: () => set(state => ({ biometricEnabled: !(state as AuthState).biometricEnabled })),
      changePin: (oldPin: string, newPin: string) => {
        const { pin: currentPin } = get();
        if (currentPin === oldPin) {
          set({ pin: newPin });
          return true;
        }
        return false;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrate: (state) => {
         useAuthStore.setState({ initialized: true });
         if(state && typeof (state as AuthState).biometricEnabled === 'undefined') {
            (state as AuthState).biometricEnabled = false;
         }
      },
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState as object) };
        if (typeof (merged as AuthState).biometricEnabled === 'undefined') {
            (merged as AuthState).biometricEnabled = false;
        }
        return merged;
      }
    }
  )
);

// This ensures that the store is initialized on the client side
if (typeof window !== 'undefined') {
    useAuthStore.getState();
}

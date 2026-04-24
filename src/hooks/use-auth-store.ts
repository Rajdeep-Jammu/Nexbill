import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  shopName: string | null;
  pin: string | null;
  isLoggedIn: boolean;
  initialized: boolean;
  biometricEnabled: boolean;
  upiId: string | null;
  qrCodeUrl: string | null;
  shopId: string | null;
  shopOwnerId: string | null;
  setup: (shopName: string, pin: string, shopId: string, shopOwnerId: string) => void;
  login: () => void;
  logout: () => void;
  reset: () => void;
  toggleBiometric: () => void;
  changePin: (oldPin: string, newPin: string) => boolean;
  setPaymentDetails: (details: { upiId: string; qrCodeUrl: string }) => void;
}

const initialState = {
  shopName: null,
  pin: null,
  isLoggedIn: false,
  initialized: false,
  biometricEnabled: false,
  upiId: 'your-shop@upi',
  qrCodeUrl: 'https://placehold.co/200x200/FFFFFF/000000?text=Scan+to+Pay',
  shopId: null,
  shopOwnerId: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setup: (shopName, pin, shopId, shopOwnerId) => {
        set({
          ...initialState,
          shopName,
          pin,
          shopId,
          shopOwnerId,
          initialized: true,
        });
      },
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
      reset: () => {
        // Also clear firebase auth? For now, just clears local state.
        set({ ...initialState, initialized: true });
      },
      toggleBiometric: () => set(state => ({ biometricEnabled: !state.biometricEnabled })),
      changePin: (oldPin: string, newPin: string) => {
        if (get().pin === oldPin) {
          set({ pin: newPin });
          return true;
        }
        return false;
      },
      setPaymentDetails: details => set({ upiId: details.upiId, qrCodeUrl: details.qrCodeUrl }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrate: () => {
        useAuthStore.setState({ initialized: true });
      },
      merge: (persistedState, currentState) => {
        const state = persistedState as any;
        if (typeof state.biometricEnabled === 'undefined') {
          state.biometricEnabled = false;
        }
        if (typeof state.upiId === 'undefined') {
          state.upiId = initialState.upiId;
        }
        if (typeof state.qrCodeUrl === 'undefined') {
          state.qrCodeUrl = initialState.qrCodeUrl;
        }
        return { ...currentState, ...state };
      },
    }
  )
);

// This ensures that the store is initialized on the client side
if (typeof window !== 'undefined') {
  useAuthStore.getState();
}

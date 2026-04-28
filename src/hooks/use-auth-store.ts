import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  shopName: string | null;
  pin: string | null;
  isLoggedIn: boolean;
  biometricEnabled: boolean;
  upiId: string | null;
  qrCodeUrl: string | null;
  shopId: string | null;
  shopOwnerId: string | null;
  setup: (
    shopName: string,
    pin: string,
    shopId: string,
    shopOwnerId: string
  ) => void;
  loadShopContext: (shopDetails: {
    shopId: string;
    shopName: string;
    shopOwnerId: string;
  }) => void;
  setPin: (pin: string) => void;
  login: () => void;
  logout: () => void;
  reset: () => void;
  toggleBiometric: () => void;
  changePin: (oldPin: string, newPin: string) => boolean;
  setPaymentDetails: (details: { upiId: string; qrCodeUrl: string }) => void;
  setShopName: (shopName: string) => void;
}

const initialState = {
  shopName: null,
  pin: null,
  isLoggedIn: false,
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
        // For initial setup, we start fresh.
        set({
          ...initialState,
          shopName,
          pin,
          shopId,
          shopOwnerId,
        });
      },
      loadShopContext: shopDetails => {
        set(state => ({
          ...state,
          shopId: shopDetails.shopId,
          shopName: shopDetails.shopName,
          shopOwnerId: shopDetails.shopOwnerId,
        }));
      },
      setPin: pin => set(state => ({ ...state, pin, isLoggedIn: false })),
      login: () => set(state => ({ ...state, isLoggedIn: true })),
      logout: () => set(state => ({ ...state, isLoggedIn: false })),
      reset: () => {
        set(initialState);
      },
      toggleBiometric: () =>
        set(state => ({ ...state, biometricEnabled: !state.biometricEnabled })),
      changePin: (oldPin: string, newPin: string) => {
        if (get().pin === oldPin) {
          set(state => ({ ...state, pin: newPin }));
          return true;
        }
        return false;
      },
      setPaymentDetails: details =>
        set(state => ({ ...state, upiId: details.upiId, qrCodeUrl: details.qrCodeUrl })),
      setShopName: shopName => set(state => ({ ...state, shopName })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
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

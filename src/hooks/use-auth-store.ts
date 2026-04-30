import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  shopName: string | null;
  upiId: string | null;
  qrCodeUrl: string | null;
  shopId: string | null;
  shopOwnerId: string | null;
  setup: (
    shopName: string,
    shopId: string,
    shopOwnerId: string
  ) => void;
  loadShopContext: (shopDetails: {
    shopId: string;
    shopName: string;
    shopOwnerId: string;
  }) => void;
  reset: () => void;
  setPaymentDetails: (details: { upiId: string; qrCodeUrl: string }) => void;
  setShopName: (shopName: string) => void;
}

const initialState = {
  shopName: null,
  upiId: 'your-shop@upi',
  qrCodeUrl: 'https://placehold.co/200x200/FFFFFF/000000?text=Scan+to+Pay',
  shopId: null,
  shopOwnerId: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setup: (shopName, shopId, shopOwnerId) => {
        set({
          ...initialState,
          shopName,
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
      reset: () => {
        set(initialState);
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

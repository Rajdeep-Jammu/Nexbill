import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

export type Sale = {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  userId?: string;
};

interface SalesState {
  sales: Sale[];
  addSale: (saleData: { items: CartItem[], total: number, userId?: string }) => void;
  deleteSale: (saleId: string) => void;
  clearSales: () => void;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: [],
      addSale: (saleData) => {
        const newSale: Sale = {
          id: `SALE-${Date.now()}`,
          ...saleData,
          date: new Date().toISOString(),
        };
        set({ sales: [newSale, ...get().sales] });
      },
      deleteSale: (saleId: string) => {
        set({ sales: get().sales.filter((s) => s.id !== saleId) });
      },
      clearSales: () => set({ sales: [] }),
    }),
    {
      name: "sales-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// This ensures that the store is initialized on the client side
if (typeof window !== 'undefined') {
    useSalesStore.getState();
}

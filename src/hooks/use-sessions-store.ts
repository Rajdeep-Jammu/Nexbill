"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

export type CheckoutSession = {
  id: string; // The unique 4-digit numeric code
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid';
  createdAt: string;
  userId?: string;
};

interface SessionsState {
  sessions: CheckoutSession[];
  createSession: (items: CartItem[], total: number, userId?: string) => CheckoutSession;
  getSession: (sessionId: string) => CheckoutSession | undefined;
  updateSessionStatus: (sessionId: string, status: 'paid') => void;
  clearSessions: () => void;
}

export const useSessionsStore = create<SessionsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      createSession: (items, total, userId) => {
        // Generate a 4-digit numeric code
        const numericId = Math.floor(1000 + Math.random() * 9000).toString();
        const newSession: CheckoutSession = {
          id: numericId,
          items,
          total,
          status: 'pending',
          createdAt: new Date().toISOString(),
          userId,
        };
        set({ sessions: [...get().sessions, newSession] });
        return newSession;
      },
      getSession: (sessionId) => {
        return get().sessions.find(s => s.id === sessionId);
      },
      updateSessionStatus: (sessionId, status) => {
        set({
          sessions: get().sessions.map(s => 
            s.id === sessionId ? { ...s, status } : s
          ),
        });
      },
      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: "checkout-sessions-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

if (typeof window !== 'undefined') {
    useSessionsStore.getState();
}

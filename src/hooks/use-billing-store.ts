import { create } from "zustand";
import type { Product, CartItem } from "@/lib/types";

interface BillingState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  items: [],
  addToCart: (product) => {
    const { items } = get();
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.cartQuantity < product.quantity) { // check against stock
        set({
          items: items.map((item) =>
            item.id === product.id
              ? { ...item, cartQuantity: item.cartQuantity + 1 }
              : item
          ),
        });
      }
    } else {
      if (product.quantity > 0) { // check stock
        set({ items: [...items, { ...product, cartQuantity: 1 }] });
      }
    }
  },
  removeFromCart: (productId) => {
    set({
      items: get().items.filter((item) => item.id !== productId),
    });
  },
  updateQuantity: (productId, quantity) => {
    const productInStock = get().items.find(item => item.id === productId);
    if (!productInStock) return;

    if (quantity <= 0) {
      get().removeFromCart(productId);
    } else {
      // Ensure we don't add more than available in stock
      const newQuantity = Math.min(quantity, productInStock.quantity);
      set({
        items: get().items.map((item) =>
          item.id === productId ? { ...item, cartQuantity: newQuantity } : item
        ),
      });
    }
  },
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((total, item) => total + item.cartQuantity, 0),
  totalAmount: () => get().items.reduce((total, item) => total + item.price * item.cartQuantity, 0),
}));

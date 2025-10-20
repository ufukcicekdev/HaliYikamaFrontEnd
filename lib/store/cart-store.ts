import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  subtypeId: number;
  subtypeName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  pricingType: 'per_sqm' | 'per_item' | 'per_seat';
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'total'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = `${item.subtypeId}-${Date.now()}`;
        const total = item.quantity * item.unitPrice;
        
        set((state) => ({
          items: [...state.items, { ...item, id, total }],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity, total: quantity * item.unitPrice }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.total, 0);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

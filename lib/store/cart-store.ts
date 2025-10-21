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
  pickupDate: Date | null;
  deliveryDate: Date | null;
  pickupTimeSlotId: number | null;
  deliveryTimeSlotId: number | null;
  addItem: (item: Omit<CartItem, 'id' | 'total'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setPickupDate: (date: Date | null) => void;
  setDeliveryDate: (date: Date | null) => void;
  setPickupTimeSlotId: (id: number | null) => void;
  setDeliveryTimeSlotId: (id: number | null) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      pickupDate: null,
      deliveryDate: null,
      pickupTimeSlotId: null,
      deliveryTimeSlotId: null,

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

      setPickupDate: (date) => {
        set({ pickupDate: date });
      },

      setDeliveryDate: (date) => {
        set({ deliveryDate: date });
      },

      setPickupTimeSlotId: (id) => {
        set({ pickupTimeSlotId: id });
      },

      setDeliveryTimeSlotId: (id) => {
        set({ deliveryTimeSlotId: id });
      },

      clearCart: () => {
        set({ items: [], pickupDate: null, deliveryDate: null, pickupTimeSlotId: null, deliveryTimeSlotId: null });
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

import { create } from 'zustand';
import { Category, District, TimeSlot } from '@/types';
import { apiClient } from '@/lib/api-client';

interface BookingState {
  // Data
  categories: Category[];
  districts: District[];
  selectedDistrict: District | null;
  selectedCategory: Category | null;
  selectedSubtypes: Map<number, { quantity: number; notes: string }>;
  selectedPickupSlot: TimeSlot | null;
  selectedDeliverySlot: TimeSlot | null;
  pickupDate: Date | null;
  deliveryDate: Date | null;
  
  // Loading states
  isLoadingCategories: boolean;
  isLoadingDistricts: boolean;
  
  // Actions
  fetchCategories: (language?: string) => Promise<void>;
  fetchDistricts: (language?: string) => Promise<void>;
  setDistrict: (district: District) => void;
  setCategory: (category: Category) => void;
  addSubtype: (subtypeId: number, quantity: number, notes?: string) => void;
  removeSubtype: (subtypeId: number) => void;
  updateSubtypeQuantity: (subtypeId: number, quantity: number) => void;
  setPickupSlot: (slot: TimeSlot, date: Date) => void;
  setDeliverySlot: (slot: TimeSlot | null, date: Date | null) => void;
  calculateTotal: () => number;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial state
  categories: [],
  districts: [],
  selectedDistrict: null,
  selectedCategory: null,
  selectedSubtypes: new Map(),
  selectedPickupSlot: null,
  selectedDeliverySlot: null,
  pickupDate: null,
  deliveryDate: null,
  isLoadingCategories: false,
  isLoadingDistricts: false,

  fetchCategories: async (language = 'en') => {
    set({ isLoadingCategories: true });
    try {
      const response = await apiClient.get(`/services/categories/?lang=${language}`);
      if (response.success && response.data) {
        set({ categories: response.data, isLoadingCategories: false });
      }
    } catch (error) {
      set({ isLoadingCategories: false });
      throw error;
    }
  },

  fetchDistricts: async (language = 'en') => {
    set({ isLoadingDistricts: true });
    try {
      const response = await apiClient.get(`/services/districts/?lang=${language}`);
      if (response.success && response.data) {
        set({ districts: response.data, isLoadingDistricts: false });
      }
    } catch (error) {
      set({ isLoadingDistricts: false });
      throw error;
    }
  },

  setDistrict: (district) => set({ selectedDistrict: district }),

  setCategory: (category) => set({ selectedCategory: category }),

  addSubtype: (subtypeId, quantity, notes = '') => {
    const { selectedSubtypes } = get();
    const newMap = new Map(selectedSubtypes);
    newMap.set(subtypeId, { quantity, notes });
    set({ selectedSubtypes: newMap });
  },

  removeSubtype: (subtypeId) => {
    const { selectedSubtypes } = get();
    const newMap = new Map(selectedSubtypes);
    newMap.delete(subtypeId);
    set({ selectedSubtypes: newMap });
  },

  updateSubtypeQuantity: (subtypeId, quantity) => {
    const { selectedSubtypes } = get();
    const existing = selectedSubtypes.get(subtypeId);
    if (existing) {
      const newMap = new Map(selectedSubtypes);
      newMap.set(subtypeId, { ...existing, quantity });
      set({ selectedSubtypes: newMap });
    }
  },

  setPickupSlot: (slot, date) => {
    set({ selectedPickupSlot: slot, pickupDate: date });
  },

  setDeliverySlot: (slot, date) => {
    set({ selectedDeliverySlot: slot, deliveryDate: date });
  },

  calculateTotal: () => {
    const { selectedCategory, selectedSubtypes, selectedDistrict } = get();
    if (!selectedCategory || !selectedDistrict) return 0;

    let subtotal = 0;

    selectedSubtypes.forEach((item, subtypeId) => {
      const subtype = selectedCategory.subtypes.find((st) => st.id === subtypeId);
      if (subtype && subtype.current_price) {
        const price = parseFloat(subtype.current_price.final_price);
        subtotal += price * item.quantity;
      }
    });

    const deliveryFee = parseFloat(selectedDistrict.delivery_fee);
    return subtotal + deliveryFee;
  },

  reset: () => {
    set({
      selectedDistrict: null,
      selectedCategory: null,
      selectedSubtypes: new Map(),
      selectedPickupSlot: null,
      selectedDeliverySlot: null,
      pickupDate: null,
      deliveryDate: null,
    });
  },
}));

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';
import { apiClient } from '@/lib/api-client';
import { useCartStore } from '@/lib/store/cart-store';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SubType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  base_price: string;
  min_quantity?: number;
  max_quantity?: number;
  current_price?: {
    base_price: string;
    final_price: string;
    discount_percentage: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  pricing_type: 'per_sqm' | 'per_item';
  subtypes: SubType[];
  requires_time_selection: boolean;
  requires_pickup_delivery: boolean;
  min_days_between_pickup_delivery: number;
}

interface SubtypeQuantity {
  [key: number]: {
    count: number;
    size: number;
  };
}

export default function KategorilerPage() {
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<SubtypeQuantity>({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number} | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimeSlots] = useState<string[]>([
    '11:00 - 13:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
    '17:00 - 19:00',
  ]);
  const [pickupDate, setPickupDate] = useState<Date | null>(null); // For carpets
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null); // For carpets
  const [pickupTimeSlots, setPickupTimeSlots] = useState<any[]>([]);
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState<any[]>([]);
  const [selectedPickupSlot, setSelectedPickupSlot] = useState<number | null>(null);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<number | null>(null);
  const { addItem, items: cartItems, removeItem: removeCartItem, setPickupDate: setCartPickupDate, setDeliveryDate: setCartDeliveryDate, setPickupTimeSlotId, setDeliveryTimeSlotId } = useCartStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/services/categories/');
        
        if (response.success && response.data?.results) {
          const cats = response.data.results;
          setAllCategories(cats);
          
          // Set first category as active by default
          if (cats.length > 0) {
            setActiveCategory(cats[0]);
            initializeQuantities(cats[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Kategoriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const initializeQuantities = (category: Category) => {
    // Only initialize quantities for subtypes that don't exist yet
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      category.subtypes.forEach((subtype: SubType) => {
        if (!newQuantities[subtype.id]) {
          newQuantities[subtype.id] = { count: 0, size: 0 };
        }
      });
      return newQuantities;
    });
  };

  const handleCategoryChange = (category: Category) => {
    console.log('Switching to category:', category.name);
    console.log('Category data:', JSON.stringify(category, null, 2));
    setActiveCategory(category);
    initializeQuantities(category);
  };

  const incrementCount = (subtypeId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [subtypeId]: {
        ...prev[subtypeId],
        count: prev[subtypeId].count + 1,
      },
    }));
  };

  const decrementCount = (subtypeId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [subtypeId]: {
        ...prev[subtypeId],
        count: Math.max(0, prev[subtypeId].count - 1),
      },
    }));
  };

  const incrementSize = (subtypeId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [subtypeId]: {
        ...prev[subtypeId],
        size: prev[subtypeId].size + 1,
      },
    }));
  };

  const decrementSize = (subtypeId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [subtypeId]: {
        ...prev[subtypeId],
        size: Math.max(0, prev[subtypeId].size - 1),
      },
    }));
  };

  const handleAddToCart = (subtype: SubType) => {
    const quantityData = quantities[subtype.id];
    
    if (!quantityData || (quantityData.count === 0 && quantityData.size === 0)) {
      toast.error('Lütfen önce miktar seçiniz');
      return;
    }

    const finalQuantity = activeCategory?.pricing_type === 'per_sqm' 
      ? quantityData.count * quantityData.size
      : quantityData.count;

    if (finalQuantity === 0) {
      toast.error('Lütfen önce miktar seçiniz');
      return;
    }

    const unitPrice = subtype.current_price ? parseFloat(subtype.current_price.base_price) : 0;

    // Add to Zustand store
    addItem({
      subtypeId: subtype.id,
      subtypeName: subtype.name,
      categoryName: activeCategory?.name || '',
      quantity: finalQuantity,
      unitPrice,
      pricingType: activeCategory?.pricing_type || 'per_item',
    });
    
    toast.success('Sepete eklendi!');
    setQuantities((prev) => ({ ...prev, [subtype.id]: { count: 0, size: 0 } }));
  };

  const removeFromCart = (itemId: string) => {
    removeCartItem(itemId);
    toast.success('Sepetten kaldırıldı');
  };

  const fetchPickupTimeSlots = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await apiClient.get(`/customer/bookings/timeslots/?date=${dateStr}`);
      if (response.success && response.data) {
        const slots = Array.isArray(response.data) ? response.data : response.data.results || [];
        setPickupTimeSlots(slots.filter((slot: any) => slot.is_available));
      }
    } catch (error) {
      console.error('Error fetching pickup time slots:', error);
      toast.error('Saat aralıkları yüklenirken hata oluştu');
    }
  };

  const fetchDeliveryTimeSlots = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await apiClient.get(`/customer/bookings/timeslots/?date=${dateStr}`);
      if (response.success && response.data) {
        const slots = Array.isArray(response.data) ? response.data : response.data.results || [];
        setDeliveryTimeSlots(slots.filter((slot: any) => slot.is_available));
      }
    } catch (error) {
      console.error('Error fetching delivery time slots:', error);
      toast.error('Saat aralıkları yüklenirken hata oluştu');
    }
  };

  const getPricingLabel = (pricingType: 'per_sqm' | 'per_item') => {
    return pricingType === 'per_sqm' ? 'm²' : 'adet';
  };

  const handleApplyCoupon = () => {
    // TODO: Call backend API to validate coupon
    // For now, mock validation
    if (couponCode.toUpperCase() === 'YENI20') {
      setAppliedCoupon({ code: couponCode, discount: 20 });
      toast.success('Kampanya kodu uygulandı! %20 indirim');
    } else if (couponCode.toUpperCase() === 'HOSGELDIN10') {
      setAppliedCoupon({ code: couponCode, discount: 10 });
      toast.success('Kampanya kodu uygulandı! %10 indirim');
    } else {
      toast.error('Geçersiz kampanya kodu');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Kampanya kodu kaldırıldı');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + ((item.total || 0) || (item.quantity * (item.unitPrice || 0))), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (appliedCoupon) {
      return subtotal * (1 - appliedCoupon.discount / 100);
    }
    return subtotal;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <Header />

      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeCategory?.id === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeCategory && (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Subtypes Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeCategory.subtypes.map((subtype) => {
                  const quantityData = quantities[subtype.id] || { count: 0, size: 0 };
                  
                  // Debug: Log the subtype data
                  console.log('Subtype:', subtype.name, 'current_price:', subtype.current_price);
                  
                  const unitPrice = subtype.current_price ? parseFloat(subtype.current_price.base_price) : 0;
                  const isPerSqm = activeCategory.pricing_type === 'per_sqm';
                  const total = isPerSqm 
                    ? quantityData.count * quantityData.size * unitPrice
                    : quantityData.count * unitPrice;

                  console.log('Unit Price:', unitPrice, 'Total:', total);

                  return (
                    <div
                      key={subtype.id}
                      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                      {/* Icon/Image */}
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                          {subtype.image ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL}${subtype.image}`} 
                              alt={subtype.name}
                              className="w-full h-full object-cover"
                            />
                          ) : subtype.icon ? (
                            <span className="text-3xl">{subtype.icon}</span>
                          ) : (
                            <span className="text-3xl">🛋️</span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center">
                          {subtype.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {unitPrice.toFixed(0)} TL / {getPricingLabel(activeCategory.pricing_type)}
                        </p>
                      </div>

                      {isPerSqm ? (
                        // For carpets: Show both adet and m²
                        <div className="space-y-4 mb-4">
                          {/* Adet Controls */}
                          <div>
                            <div className="text-xs text-gray-600 text-center mb-2">Adet</div>
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() => decrementCount(subtype.id)}
                                className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                disabled={quantityData.count === 0}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              
                              <div className="w-16 text-center">
                                <div className="text-2xl font-bold text-gray-900">{quantityData.count}</div>
                              </div>
                              
                              <button
                                onClick={() => incrementCount(subtype.id)}
                                className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* m² Controls */}
                          <div>
                            <div className="text-xs text-gray-600 text-center mb-2">m² (her halı)</div>
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() => decrementSize(subtype.id)}
                                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                disabled={quantityData.size === 0}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              
                              <div className="w-16 text-center">
                                <div className="text-2xl font-bold text-gray-900">{quantityData.size}</div>
                              </div>
                              
                              <button
                                onClick={() => incrementSize(subtype.id)}
                                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // For sofas: Show only adet
                        <div className="mb-4">
                          <div className="text-xs text-gray-600 text-center mb-2">Adet</div>
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => decrementCount(subtype.id)}
                              className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                              disabled={quantityData.count === 0}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <div className="w-16 text-center">
                              <div className="text-2xl font-bold text-gray-900">{quantityData.count}</div>
                            </div>
                            
                            <button
                              onClick={() => incrementCount(subtype.id)}
                              className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Price Display */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {total.toFixed(0)} TL
                        </div>
                        {total > 0 && (
                          <button
                            onClick={() => handleAddToCart(subtype)}
                            className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                          >
                            Sepete Ekle
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar - Date Picker & Cart */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Tarih</h3>
                    <p className="text-sm text-gray-500">ve Saat Seçiniz</p>
                  </div>
                </div>

                {/* Date and Time Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {selectedDate ? selectedDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : '2025-10-21'}
                    </span>
                    <span className="text-sm text-gray-500">ve Saat Seçiniz</span>
                  </div>
                  
                  {/* Month and Year Selector */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>Ekim</option>
                      <option>Kasım</option>
                      <option>Aralık</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>2025</option>
                      <option>2026</option>
                    </select>
                  </div>

                  {/* Calendar */}
                  <div className="mb-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['PT', 'SA', 'ÇA', 'PE', 'CU', 'CT', 'PZ'].map((day) => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells for alignment */}
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                      ))}
                      {/* Calendar days */}
                      {Array.from({ length: 26 }, (_, i) => i + 6).map((day) => {
                        const isSelected = day === 21;
                        const isPast = day < 21;
                        return (
                          <button
                            key={day}
                            onClick={() => {
                              const newDate = new Date(2025, 9, day); // October 2025
                              setSelectedDate(newDate);
                            }}
                            disabled={isPast}
                            className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                              ${isSelected 
                                ? 'bg-purple-600 text-white' 
                                : isPast
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-900 hover:bg-purple-50'}
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">MÜSAİT SAAT SEÇİNİZ:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {availableTimeSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all
                              ${selectedTime === slot
                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'}
                            `}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Kampanya Kodu */}
                <div className="mb-6 border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kampanya Kodu
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                      <div>
                        <div className="font-semibold text-green-800">{appliedCoupon.code}</div>
                        <div className="text-sm text-green-600">%{appliedCoupon.discount} indirim uygulandı</div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Kampanya kodunu girin"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                      >
                        Uygula
                      </button>
                    </div>
                  )}
                </div>

                {/* Sepetim Section */}
                <div className="border-t pt-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>✨</span> Sepetim
                  </h3>
                  
                  {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">Sepetiniz boş</p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {cartItems.map((item) => {
                        const itemTotal = (item.total || 0) || (item.quantity * (item.unitPrice || 0));
                        const isPerSqm = item.pricingType === 'per_sqm';
                        return (
                          <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{item.subtypeName}</div>
                                <div className="text-xs text-gray-500">{item.categoryName}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {item.quantity} {isPerSqm ? 'm²' : 'adet'}
                                </div>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{(item.unitPrice || 0).toFixed(0)} TL / {isPerSqm ? 'm²' : 'adet'}</span>
                              <span className="font-bold text-purple-600">{itemTotal.toFixed(0)} TL</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pickup/Delivery dates - show if any cart item's category requires it */}
                  {cartItems.some(item => {
                    const cat = allCategories.find(c => c.name === item.categoryName);
                    return cat?.requires_pickup_delivery;
                  }) && (
                    <div className="mb-4 border-t pt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alım tarihi:
                        </label>
                        <DatePicker
                          selected={pickupDate}
                          onChange={(date) => {
                            setPickupDate(date);
                            setCartPickupDate(date);
                            setSelectedPickupSlot(null);
                            setPickupTimeSlotId(null);
                            // Check if time selection is required
                            const requiresTimeSelection = cartItems.some(item => {
                              const cat = allCategories.find(c => c.name === item.categoryName);
                              return cat?.requires_time_selection;
                            });
                            // Fetch time slots for selected date only if required
                            if (date && requiresTimeSelection) {
                              fetchPickupTimeSlots(date);
                            }
                          }}
                          minDate={new Date()}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Alım tarihi seçiniz"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                          calendarClassName="shadow-xl"
                        />
                      </div>
                      {/* Only show time slot selection if category requires it */}
                      {cartItems.some(item => {
                        const cat = allCategories.find(c => c.name === item.categoryName);
                        return cat?.requires_time_selection;
                      }) && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alım saati:
                          </label>
                          {pickupTimeSlots.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {pickupTimeSlots.map((slot: any) => (
                                <button
                                  key={slot.id}
                                  onClick={() => {
                                    setSelectedPickupSlot(slot.id);
                                    setPickupTimeSlotId(slot.id);
                                  }}
                                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                    selectedPickupSlot === slot.id
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {slot.start_time} - {slot.end_time}
                                </button>
                              ))}
                            </div>
                          ) : pickupDate ? (
                            <p className="text-sm text-gray-500">Bu tarih için müsait saat yok</p>
                          ) : (
                            <p className="text-sm text-gray-500">Önce tarih seçiniz</p>
                          )}
                        </div>
                      )}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teslim tarihi:
                        </label>
                        <DatePicker
                          selected={deliveryDate}
                          onChange={(date) => {
                            setDeliveryDate(date);
                            setCartDeliveryDate(date);
                            setSelectedDeliverySlot(null);
                            setDeliveryTimeSlotId(null);
                            // Check if time selection is required
                            const requiresTimeSelection = cartItems.some(item => {
                              const cat = allCategories.find(c => c.name === item.categoryName);
                              return cat?.requires_time_selection;
                            });
                            // Fetch time slots for selected date only if required
                            if (date && requiresTimeSelection) {
                              fetchDeliveryTimeSlots(date);
                            }
                          }}
                          minDate={pickupDate ? new Date(pickupDate.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date()}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Teslim tarihi seçiniz"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                          calendarClassName="shadow-xl"
                          disabled={!pickupDate}
                        />
                      </div>
                      {/* Only show time slot selection if category requires it */}
                      {cartItems.some(item => {
                        const cat = allCategories.find(c => c.name === item.categoryName);
                        return cat?.requires_time_selection;
                      }) && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teslim saati:
                          </label>
                          {deliveryTimeSlots.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {deliveryTimeSlots.map((slot: any) => (
                                <button
                                  key={slot.id}
                                  onClick={() => {
                                    setSelectedDeliverySlot(slot.id);
                                    setDeliveryTimeSlotId(slot.id);
                                  }}
                                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                    selectedDeliverySlot === slot.id
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {slot.start_time} - {slot.end_time}
                                </button>
                              ))}
                            </div>
                          ) : deliveryDate ? (
                            <p className="text-sm text-gray-500">Bu tarih için müsait saat yok</p>
                          ) : (
                            <p className="text-sm text-gray-500">Önce tarih seçiniz</p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Alım ve teslim tarihleri arasında minimum 7 gün fark olmalıdır.
                      </p>
                    </div>
                  )}
                  
                  {cartItems.length > 0 && (
                    <>
                      <div className="border-t pt-3 mb-3 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Ara Toplam:</span>
                          <span className="font-semibold">{calculateSubtotal().toFixed(0)} TL</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-600">Kampanya İndirimi ({appliedCoupon.code}):</span>
                            <span className="font-semibold text-green-600">-{(calculateSubtotal() * appliedCoupon.discount / 100).toFixed(0)} TL</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-bold text-gray-900">Toplam:</span>
                          <span className="text-2xl font-bold text-purple-600">
                            {calculateTotal().toFixed(0)} TL
                          </span>
                        </div>
                      </div>
                      <button
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-center"
                        onClick={() => {
                          if (cartItems.length === 0) {
                            toast.error('Lütfen önce sepete ürün ekleyin');
                            return;
                          }
                          router.push('/siparis-olustur');
                        }}
                      >
                        Hizmeti Onayla
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

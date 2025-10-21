'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface Address {
  id: number;
  title: string;
  full_address: string;
  district_details?: {
    id: number;
    name: string;
  };
}

export default function SiparisOlusturPage() {
  const router = useRouter();
  const { items, clearCart, getTotal, pickupDate, deliveryDate, pickupTimeSlotId, deliveryTimeSlotId } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  // State
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Notes & Submit
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedPickupAddress, setSelectedPickupAddress] = useState<number | null>(null);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<number | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [customerNotes, setCustomerNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapınız');
      router.push('/login');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Sepetiniz boş');
      router.push('/kategoriler');
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, items]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/auth/addresses/');
      if (response.success && response.data) {
        const addressList = Array.isArray(response.data) ? response.data : response.data.results || [];
        setAddresses(addressList);
        
        if (addressList.length > 0) {
          setSelectedPickupAddress(addressList[0].id);
          if (useSameAddress) {
            setSelectedDeliveryAddress(addressList[0].id);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      toast.error('Adresler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedPickupAddress) {
        toast.error('Lütfen alım adresi seçiniz');
        return;
      }
      if (!useSameAddress && !selectedDeliveryAddress) {
        toast.error('Lütfen teslimat adresi seçiniz');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Validation
    if (!pickupDate) {
      toast.error('Lütfen kategoriler sayfasından alım tarihi seçiniz');
      return;
    }

    // Only validate time slot if it was required (pickupTimeSlotId will be set if required)
    // For categories that don't require time selection, pickupTimeSlotId will be null

    setIsSubmitting(true);

    try {
      // Format dates for API
      const formatDate = (date: Date | null) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      const bookingData: any = {
        pickup_address: selectedPickupAddress,
        delivery_address: useSameAddress ? selectedPickupAddress : selectedDeliveryAddress,
        pickup_date: formatDate(pickupDate),
        delivery_date: formatDate(deliveryDate || pickupDate),
        customer_notes: customerNotes,
        items: items.map(item => ({
          subtype_id: item.subtypeId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          notes: '',
        })),
      };

      // Only include time slots if they were selected (i.e., if category requires it)
      if (pickupTimeSlotId) {
        bookingData.pickup_time_slot = pickupTimeSlotId;
      }
      if (deliveryTimeSlotId) {
        bookingData.delivery_time_slot = deliveryTimeSlotId;
      }

      const response = await apiClient.post('/customer/bookings/', bookingData);

      if (response.success) {
        toast.success('Siparişiniz başarıyla oluşturuldu!');
        clearCart();
        
        const bookingId = response.data?.id || response.data?.booking?.id;
        
        if (bookingId) {
          router.push(`/dashboard/siparisler/${bookingId}`);
        } else {
          router.push('/dashboard/siparislerim');
        }
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Sipariş oluşturulamadı';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: 'Adres Seçimi', icon: MapPinIcon },
                { num: 2, label: 'Not Ekle & Onayla', icon: DocumentTextIcon },
              ].map((step, index) => (
                <div key={step.num} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center flex-1 ${index > 0 ? 'ml-4' : ''}`}>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        currentStep >= step.num
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.num ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        currentStep >= step.num ? 'text-purple-600' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step.num ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Step 1: Address Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Adres Bilgileri</h2>
                
                {/* Pickup Address */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Alım Adresi
                    </label>
                    <button
                      onClick={() => router.push('/dashboard/addresses')}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Yeni Adres Ekle
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => {
                          setSelectedPickupAddress(address.id);
                          if (useSameAddress) {
                            setSelectedDeliveryAddress(address.id);
                          }
                        }}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPickupAddress === address.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{address.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{address.full_address}</p>
                            {address.district_details && (
                              <p className="text-xs text-gray-500 mt-1">
                                {address.district_details.name}
                              </p>
                            )}
                          </div>
                          {selectedPickupAddress === address.id && (
                            <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {addresses.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      Henüz kayıtlı adresiniz yok. Lütfen yeni adres ekleyin.
                    </p>
                  )}
                </div>

                {/* Same Address Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={useSameAddress}
                    onChange={(e) => {
                      setUseSameAddress(e.target.checked);
                      if (e.target.checked) {
                        setSelectedDeliveryAddress(selectedPickupAddress);
                      }
                    }}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="sameAddress" className="text-sm text-gray-700">
                    Teslimat adresi ile aynı
                  </label>
                </div>

                {/* Delivery Address */}
                {!useSameAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Teslimat Adresi
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          onClick={() => setSelectedDeliveryAddress(address.id)}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedDeliveryAddress === address.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{address.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{address.full_address}</p>
                              {address.district_details && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {address.district_details.name}
                                </p>
                              )}
                            </div>
                            {selectedDeliveryAddress === address.id && (
                              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Customer Notes & Order Summary */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Sipariş Notunuz & Özet</h2>
                
                {/* Customer Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Varsa eklemek istediğiniz notları yazabilirsiniz (Opsiyonel)
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={4}
                    placeholder="Örn: Hassas temizlik gerekiyor, leke var..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Sipariş Detayları</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{item.subtypeName}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.pricingType === 'per_sqm' ? 'm²' : 'adet'}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {(item.total || item.quantity * item.unitPrice).toFixed(2)} ₺
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-300 mt-4 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Toplam</span>
                      <span className="text-purple-600">{getTotal().toFixed(2)} ₺</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Bilgilendirme:</strong> Ödeme yöntemi daha sonra eklenecektir. 
                    Şimdilik siparişinizi onaylayarak devam edebilirsiniz.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Geri
                </button>
              )}
              
              {currentStep < 2 ? (
                <button
                  onClick={handleNextStep}
                  className={`px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium ${
                    currentStep === 1 ? 'ml-auto' : ''
                  }`}
                >
                  İleri
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'İşleniyor...' : 'Siparişi Onayla'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

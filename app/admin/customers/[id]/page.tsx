'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface CustomerDetail {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_joined: string;
  addresses: Address[];
  bookings: Booking[];
  total_bookings: number;
  total_spent: number;
}

interface Address {
  id: number;
  title: string;
  district: string;
  full_address: string;
  is_default: boolean;
}

interface Booking {
  id: number;
  service_date: string;
  service_time: string;
  status: string;
  total_price: number;
  created_at: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerDetail();
  }, [customerId]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/customers/${customerId}/`);
      
      if (response.success && response.data) {
        // Backend returns { success: true, data: {...} }
        // apiClient wraps it, so response.data.data is the actual customer object
        const backendResponse = response.data as any;
        const customerData = backendResponse.data || backendResponse;
        
        setCustomer(customerData);
      }
    } catch (error: any) {
      console.error('Error fetching customer detail:', error);
      toast.error('Müşteri bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    // Handle Django datetime strings with microseconds
    // e.g., "2025-10-20T06:26:24.222619+00:00"
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error parsing date:', error);
      return '-';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      in_progress: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Müşteri bulunamadı</p>
          <button
            onClick={() => router.push('/admin/customers')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/customers')}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Müşterilere Dön
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.first_name} {customer.last_name}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Müşteri ID: {customer.id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                İletişim Bilgileri
              </h2>
              <div className="space-y-3">
                <a
                  href={`mailto:${customer.email}`}
                  className="flex items-center text-sm text-gray-700 hover:text-blue-600"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                  {customer.email}
                </a>
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center text-sm text-gray-700 hover:text-blue-600"
                  >
                    <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {customer.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                İstatistikler
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Kayıt Tarihi</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(customer.date_joined)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Sipariş</p>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.total_bookings || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Harcama</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(customer.total_spent || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Adresler
              </h2>
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-3">
                  {customer.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {address.title}
                            {address.is_default && (
                              <span className="ml-2 text-xs text-blue-600">
                                (Varsayılan)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {address.district}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {address.full_address}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Kayıtlı adres yok</p>
              )}
            </div>
          </div>

          {/* Right Column - Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sipariş Geçmişi
              </h2>
              {customer.bookings && customer.bookings.length > 0 ? (
                <div className="space-y-4">
                  {customer.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/orders/${booking.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <ShoppingBagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Sipariş #{booking.id}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatDate(booking.service_date)} - {booking.service_time}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Oluşturulma: {formatDate(booking.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(booking.total_price)}
                          </p>
                          <span
                            className={`inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Henüz sipariş yok</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

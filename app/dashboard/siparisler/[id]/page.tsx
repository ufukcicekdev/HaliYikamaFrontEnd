'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface BookingDetail {
  id: string;
  booking_number?: string;
  status: string;
  status_display: string;
  pickup_date: string;
  pickup_address_details?: {
    id: number;
    title: string;
    full_address: string;
    district_details?: {
      name: string;
    };
  };
  delivery_address_details?: {
    id: number;
    title: string;
    full_address: string;
  };
  items: Array<{
    id: number;
    subtype_details: {
      id: number;
      name_tr: string;
      name_en: string;
    };
    quantity: string;
    unit_price: string;
    line_total: string;
    notes?: string;
  }>;
  subtotal: string;
  delivery_fee: string;
  discount: string;
  total: string;
  currency: string;
  customer_notes?: string;
  created_at: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  can_cancel: boolean;
  cancellation_info?: {
    can_cancel: boolean;
    message: string;
  };
}

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBookingDetail();
    }
  }, [params.id]);

  const fetchBookingDetail = async () => {
    try {
      const response = await apiClient.get(`/customer/bookings/${params.id}/`);
      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        toast.error('Sipariş bulunamadı');
        router.push('/dashboard/siparislerim');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Sipariş yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    if (!confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await apiClient.post(`/customer/bookings/${booking.id}/cancel/`, {
        reason: 'Müşteri tarafından iptal edildi'
      });
      
      if (response.success) {
        toast.success('Sipariş iptal edildi');
        fetchBookingDetail();
      } else {
        toast.error(response.error?.message || 'İptal işlemi başarısız');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('İptal işlemi sırasında hata oluştu');
    }
  };

  const getStatusBadge = (status: string, statusDisplay: string) => {
    const statusConfig: Record<string, { className: string; icon: any }> = {
      pending: { 
        className: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon,
      },
      confirmed: { 
        className: 'bg-blue-100 text-blue-800',
        icon: CheckCircleIcon,
      },
      in_progress: { 
        className: 'bg-purple-100 text-purple-800',
        icon: TruckIcon,
      },
      completed: { 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
      },
      cancelled: { 
        className: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.className}`}>
        <Icon className="h-4 w-4" />
        {statusDisplay}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sipariş bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/siparislerim"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sipariş Detayı
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              #{booking.booking_number || booking.id.substring(0, 8)}
            </p>
          </div>
        </div>
        <div>
          {getStatusBadge(booking.status, booking.status_display)}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Kalemleri</h2>
            <div className="space-y-3">
              {booking.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.subtype_details.name_tr}</h3>
                    <p className="text-sm text-gray-500">Miktar: {item.quantity}</p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 mt-1">Not: {item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.line_total} {booking.currency}</p>
                    <p className="text-xs text-gray-500">{item.unit_price} {booking.currency} / birim</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam</span>
                <span className="text-gray-900">{booking.subtotal} {booking.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Teslimat Ücreti</span>
                <span className="text-gray-900">{booking.delivery_fee} {booking.currency}</span>
              </div>
              {parseFloat(booking.discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>İndirim</span>
                  <span>-{booking.discount} {booking.currency}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Toplam</span>
                <span className="text-gray-900">{booking.total} {booking.currency}</span>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {booking.customer_notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Müşteri Notu</h2>
              <p className="text-gray-600">{booking.customer_notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Pickup Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alım Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tarih</p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.pickup_date).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              {booking.pickup_address_details && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.pickup_address_details.title}</p>
                    <p className="text-sm text-gray-600">{booking.pickup_address_details.full_address}</p>
                    {booking.pickup_address_details.district_details && (
                      <p className="text-xs text-gray-500 mt-1">{booking.pickup_address_details.district_details.name}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Geçmişi</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sipariş Oluşturuldu</p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
              {booking.confirmed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Onaylandı</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.confirmed_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}
              {booking.completed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tamamlandı</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.completed_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}
              {booking.cancelled_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">İptal Edildi</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.cancelled_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {booking.can_cancel && booking.status === 'pending' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={handleCancelBooking}
                className="w-full px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors"
              >
                Siparişi İptal Et
              </button>
              {booking.cancellation_info && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {booking.cancellation_info.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

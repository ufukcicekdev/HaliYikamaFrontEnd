'use client';

import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TruckIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  booking_number?: string;
  status: string;
  pickup_date: string;
  pickup_address_details?: {
    title: string;
    full_address: string;
    district_details?: {
      name: string;
    };
  };
  total: string;
  currency: string;
  created_at: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [statusFilter, allBookings]);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/customer/bookings/');
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setAllBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (statusFilter === 'all') {
      setBookings(allBookings);
    } else {
      setBookings(allBookings.filter(booking => booking.status === statusFilter));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { 
        label: 'Bekliyor', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon,
      },
      confirmed: { 
        label: 'Onaylandı', 
        className: 'bg-blue-100 text-blue-800',
        icon: CheckCircleIcon,
      },
      in_progress: { 
        label: 'İşlemde', 
        className: 'bg-purple-100 text-purple-800',
        icon: TruckIcon,
      },
      completed: { 
        label: 'Tamamlandı', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
      },
      cancelled: { 
        label: 'İptal Edildi', 
        className: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await apiClient.patch(`/customer/bookings/${bookingId}/`, { status: 'cancelled' });
      if (response.success) {
        fetchAllBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Siparişlerim</h1>
        <p className="mt-1 text-sm text-gray-600">
          Tüm rezervasyonlarınızı görüntüleyin ve yönetin
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtrele:</span>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tümü' },
              { value: 'pending', label: 'Bekleyen' },
              { value: 'confirmed', label: 'Onaylanan' },
              { value: 'in_progress', label: 'İşlemde' },
              { value: 'completed', label: 'Tamamlanan' },
              { value: 'cancelled', label: 'İptal Edilen' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/siparisler/${booking.id}`}
              className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sipariş #{booking.booking_number || booking.id.substring(0, 8)}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Sipariş No:</span> {booking.booking_number || booking.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tarih:</span>{' '}
                      {new Date(booking.pickup_date).toLocaleDateString('tr-TR')}
                    </p>
                    {booking.pickup_address_details && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Adres:</span> {booking.pickup_address_details.title}
                        {booking.pickup_address_details.district_details && (
                          <span> - {booking.pickup_address_details.district_details.name}</span>
                        )}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Sipariş Tarihi:</span>{' '}
                      {new Date(booking.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{booking.total} {booking.currency}</p>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="mt-4 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sipariş bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'all' 
              ? 'Henüz hiç sipariş vermediniz' 
              : 'Bu kategoride sipariş bulunamadı'}
          </p>
        </div>
      )}
    </div>
  );
}

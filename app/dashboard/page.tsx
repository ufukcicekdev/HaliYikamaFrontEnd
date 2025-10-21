'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
}

interface RecentBooking {
  id: string;
  booking_number?: string;
  status: string;
  pickup_date: string;
  pickup_address_details?: {
    title: string;
    full_address: string;
  };
  total: string;
  currency: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    total_bookings: 0,
    pending_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, bookingsResponse] = await Promise.all([
        apiClient.get('/customer/bookings/stats/'),
        apiClient.get('/customer/bookings/?limit=5'),
      ]);

      console.log('📊 Stats response:', statsResponse);

      if (statsResponse.success && statsResponse.data) {
        // Backend returns: { success: true, data: { total_bookings, ... } }
        // But our response might be double-wrapped, so check both
        const rawData = statsResponse.data;
        console.log('📊 Raw data:', rawData);
        
        // Check if data is double-nested
        const actualData = rawData.data || rawData;
        console.log('📊 Actual data:', actualData);
        
        setStats({
          total_bookings: actualData.total_bookings || 0,
          pending_bookings: actualData.pending_bookings || 0,
          completed_bookings: actualData.completed_bookings || 0,
          cancelled_bookings: actualData.cancelled_bookings || 0,
        });
        
        console.log('📊 Stats set to:', {
          total_bookings: actualData.total_bookings || 0,
          pending_bookings: actualData.pending_bookings || 0,
          completed_bookings: actualData.completed_bookings || 0,
          cancelled_bookings: actualData.cancelled_bookings || 0,
        });
      }

      if (bookingsResponse.success && bookingsResponse.data) {
        setRecentBookings(bookingsResponse.data.results || bookingsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hoş geldin, {user?.first_name} {user?.last_name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Halı yıkama hizmetlerinizi buradan takip edebilirsiniz
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_bookings}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bekleyen</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending_bookings}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.completed_bookings}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">İptal Edilen</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats.cancelled_bookings}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-sm p-6 text-white">
        <h2 className="text-xl font-bold">Hemen Rezervasyon Yap</h2>
        <p className="mt-1 text-primary-100">Halı, koltuk ve diğer temizlik hizmetlerimizden faydalanın</p>
        <Link
          href="/#hizmetler"
          className="mt-4 inline-flex items-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
        >
          Hizmetleri Gör
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Son Siparişler</h2>
            <Link
              href="/dashboard/siparislerim"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Tümünü Gör
            </Link>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/dashboard/siparisler/${booking.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      Sipariş #{booking.booking_number || booking.id.substring(0, 8)}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Tarih: {new Date(booking.pickup_date).toLocaleDateString('tr-TR')}
                    </p>
                    {booking.pickup_address_details && (
                      <p className="mt-1 text-xs text-gray-500">
                        Adres: {booking.pickup_address_details.title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {booking.total} {booking.currency}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz sipariş yok</h3>
              <p className="mt-1 text-sm text-gray-500">İlk rezervasyonunuzu oluşturarak başlayın</p>
              <Link
                href="/#hizmetler"
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Rezervasyon Yap
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Missing import
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

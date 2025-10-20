'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { 
  ShoppingBagIcon,
  UsersIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_bookings: number;
  pending_bookings: number;
  completed_bookings?: number; // Optional as it might come from status_breakdown
  cancelled_bookings?: number; // Optional as it might come from status_breakdown
  total_revenue: string;
  today_revenue: string;
  month_revenue: string;
  active_customers: number;
  today_bookings: number;
  month_bookings: number;
  status_breakdown?: Array<{
    status: string;
    count: number;
  }>;
  revenue_trend?: Array<{
    date: string;
    revenue: string;
  }>;
}

interface RecentBooking {
  id: number;
  booking_number?: string;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  status: string;
  pickup_date: string;
  pickup_address_details?: {
    title: string;
  };
  total: string;
  currency: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_bookings: 0,
    pending_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
    total_revenue: '0',
    today_revenue: '0',
    month_revenue: '0',
    active_customers: 0,
    today_bookings: 0,
    month_bookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    console.log('✨ Stats state changed to:', stats);
  }, [stats]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats and recent bookings
      const [statsResponse, bookingsResponse] = await Promise.all([
        apiClient.get('/admin/stats/'),
        apiClient.get('/admin/recent-bookings/?limit=10'),
      ]);

      console.log('Stats response:', statsResponse);
      console.log('Stats data:', statsResponse.data);
      console.log('Bookings response:', bookingsResponse);


      if (statsResponse.success && statsResponse.data) {
        // Handle nested response structure
        const data = statsResponse.data.data || statsResponse.data;
        
        console.log('📊 Actual stats data:', data);
        
        // Calculate completed and cancelled counts from status_breakdown if not directly provided
        let completedCount = data.completed_bookings || 0;
        let cancelledCount = data.cancelled_bookings || 0;
        
        if (data.status_breakdown && Array.isArray(data.status_breakdown)) {
          const completedItem = data.status_breakdown.find((item: any) => item.status === 'completed');
          const cancelledItem = data.status_breakdown.find((item: any) => item.status === 'cancelled');
          const confirmedItem = data.status_breakdown.find((item: any) => item.status === 'confirmed');
          
          // Treat 'confirmed' as completed for display purposes
          if (confirmedItem) completedCount += confirmedItem.count;
          if (completedItem) completedCount += completedItem.count;
          if (cancelledItem) cancelledCount = cancelledItem.count;
        }
        
        const updatedStats = {
          total_bookings: data.total_bookings || 0,
          pending_bookings: data.pending_bookings || 0,
          completed_bookings: completedCount,
          cancelled_bookings: cancelledCount,
          total_revenue: data.total_revenue || '0',
          today_revenue: data.today_revenue || '0',
          month_revenue: data.month_revenue || '0',
          active_customers: data.active_customers || 0,
          today_bookings: data.today_bookings || 0,
          month_bookings: data.month_bookings || 0,
        };
        
        console.log('✅ Final stats to set:', updatedStats);
        setStats(updatedStats);
      } else {
        console.error('Stats response unsuccessful or no data');
      }

      if (bookingsResponse.success && bookingsResponse.data) {
        const bookings = Array.isArray(bookingsResponse.data) 
          ? bookingsResponse.data 
          : bookingsResponse.data.results || bookingsResponse.data.data || [];
        console.log('Recent bookings:', bookings);
        setRecentBookings(bookings);
      } else {
        console.error('Bookings response unsuccessful or no data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Bekliyor', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Onaylandı', className: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'İşlemde', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Tamamlandı', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'İptal Edildi', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
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

  // Temporary debug output
  console.log('Current stats state:', stats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Hoş geldiniz! İşletmenizin genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_bookings}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Bugün: <span className="font-semibold text-blue-600">{stats.today_bookings}</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.active_customers || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <UsersIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <Link href="/admin/customers" className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Tümünü Gör →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.total_revenue && !isNaN(parseFloat(stats.total_revenue)) 
                  ? parseFloat(stats.total_revenue).toFixed(0) 
                  : '0'} ₺
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BanknotesIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <Link href="/admin/reports" className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Raporları Gör →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bekleyen</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending_bookings}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <Link href="/admin/orders?status=pending" className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            İncele →
          </Link>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Tamamlanan Siparişler</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{stats.completed_bookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <XCircleIcon className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">İptal Edilen Siparişler</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{stats.cancelled_bookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <ShoppingBagIcon className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Bu Ay</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">{stats.month_bookings}</p>
              <p className="text-xs text-blue-600 mt-1">
                Gelir: {stats.month_revenue && !isNaN(parseFloat(stats.month_revenue)) 
                  ? parseFloat(stats.month_revenue).toFixed(0) 
                  : '0'} ₺
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Son Siparişler</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Tümünü Gör
            </Link>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hizmet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.booking_number || booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.user_details ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user_details.first_name} {booking.user_details.last_name}
                          </div>
                          {booking.user_details.phone && (
                            <a
                              href={`tel:${booking.user_details.phone}`}
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              📞 {booking.user_details.phone}
                            </a>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Müşteri bilgisi yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.pickup_address_details?.title || 'Adres bilgisi yok'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.pickup_date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {booking.total} {booking.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/orders/${booking.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    Henüz sipariş bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <div key={booking.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">#{booking.booking_number || booking.id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.pickup_date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                {booking.user_details && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.user_details.first_name} {booking.user_details.last_name}
                    </p>
                    {booking.user_details.phone && (
                      <a
                        href={`tel:${booking.user_details.phone}`}
                        className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-1"
                      >
                        📞 {booking.user_details.phone}
                      </a>
                    )}
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-xs text-gray-500">Adres</p>
                  <p className="text-sm text-gray-700">{booking.pickup_address_details?.title || 'Adres bilgisi yok'}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">{booking.total} {booking.currency}</p>
                  <Link
                    href={`/admin/orders/${booking.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Detay →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-sm text-gray-500">
              Henüz sipariş bulunmuyor
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

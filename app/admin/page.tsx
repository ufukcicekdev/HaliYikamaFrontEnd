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
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: string;
  total_customers: number;
  today_bookings: number;
}

interface RecentBooking {
  id: number;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  status: string;
  scheduled_date: string;
  total_price: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_bookings: 0,
    pending_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
    total_revenue: '0',
    total_customers: 0,
    today_bookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats and recent bookings
      const [statsResponse, bookingsResponse] = await Promise.all([
        apiClient.get('/admin/stats/'),
        apiClient.get('/admin/recent-bookings/?limit=10'),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
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
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_customers}</p>
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
              <p className="mt-2 text-3xl font-bold text-gray-900">{parseFloat(stats.total_revenue).toFixed(0)} ₺</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Tamamlanan Siparişler</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{stats.completed_bookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <XCircleIcon className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">İptal Edilen Siparişler</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{stats.cancelled_bookings}</p>
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

        <div className="overflow-x-auto">
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
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                      {booking.customer_phone && (
                        <a
                          href={`tel:${booking.customer_phone}`}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          📞 {booking.customer_phone}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.service_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.scheduled_date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {booking.total_price} ₺
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
      </div>
    </div>
  );
}

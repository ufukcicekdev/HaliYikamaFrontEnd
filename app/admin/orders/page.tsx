'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import FilterSelect, { STATUS_FILTER_OPTIONS } from '@/components/FilterSelect';

interface Booking {
  id: number;
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  service_name: string;
  category_name: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  total_price: string;
  address: {
    title: string;
    address_line: string;
    district_name: string;
  };
  created_at: string;
}

export default function AdminOrdersPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' 
        ? '/admin/bookings/' 
        : `/admin/bookings/?status=${statusFilter}`;
      
      const response = await apiClient.get(url);
      if (response.success && response.data) {
        setBookings(Array.isArray(response.data) ? response.data : response.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      const response = await apiClient.patch(`/admin/bookings/${bookingId}/`, { status: newStatus });
      if (response.success) {
        toast.success('Sipariş durumu güncellendi');
        fetchBookings();
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleExportPDF = async (bookingId: number) => {
    try {
      // TODO: Implement PDF export
      toast.success('PDF oluşturuluyor...');
      window.open(`/api/admin/bookings/${bookingId}/pdf`, '_blank');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('PDF oluşturulamadı');
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

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.id.toString().includes(searchLower) ||
      `${booking.customer.first_name} ${booking.customer.last_name}`.toLowerCase().includes(searchLower) ||
      booking.customer.email.toLowerCase().includes(searchLower) ||
      booking.customer.phone.includes(searchTerm) ||
      booking.service_name.toLowerCase().includes(searchLower)
    );
  });

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
        <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
        <p className="mt-1 text-sm text-gray-600">
          Tüm siparişleri görüntüleyin ve yönetin
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Sipariş no, müşteri adı, telefon..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Status Filter */}
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            showIcon={true}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hizmet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih/Saat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/customers/${booking.customer.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {booking.customer.first_name} {booking.customer.last_name}
                      </Link>
                      <div className="text-xs text-gray-500">{booking.customer.email}</div>
                      {booking.customer.phone && (
                        <a
                          href={`tel:${booking.customer.phone}`}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                        >
                          📞 {booking.customer.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.service_name}</div>
                      <div className="text-xs text-gray-500">{booking.category_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.scheduled_date).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-500">{booking.scheduled_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {booking.total_price} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="pending">Bekliyor</option>
                        <option value="confirmed">Onaylandı</option>
                        <option value="in_progress">İşlemde</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="cancelled">İptal</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link
                        href={`/admin/orders/${booking.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Detay
                      </Link>
                      <button
                        onClick={() => handleExportPDF(booking.id)}
                        className="text-green-600 hover:text-green-700 font-medium"
                        title="PDF olarak indir"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz sipariş bulunmuyor'}
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

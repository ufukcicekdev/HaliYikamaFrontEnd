'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import FilterSelect, { DATE_RANGE_OPTIONS } from '@/components/FilterSelect';

interface ReportStats {
  total_revenue: number;
  total_bookings: number;
  total_customers: number;
  completed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  average_order_value: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    total_revenue: 0,
    total_bookings: 0,
    total_customers: 0,
    completed_bookings: 0,
    pending_bookings: 0,
    cancelled_bookings: 0,
    average_order_value: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/reports/?days=${dateRange}`);
      
      console.log('📊 Reports response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure
        const data = response.data.data || response.data;
        
        console.log('📊 Actual reports data:', data);
        
        setStats(data.stats || stats);
        setRevenueData(data.revenue_data || []);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error('Raporlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <dt className="text-sm font-medium text-gray-500 mb-1">{title}</dt>
          <dd className="text-xl font-semibold text-gray-900 break-words">{value}</dd>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
            <p className="mt-1 text-sm text-gray-600">
              İşletme performansınızı inceleyin
            </p>
          </div>
          <FilterSelect
            value={dateRange}
            onChange={setDateRange}
            options={DATE_RANGE_OPTIONS}
            showIcon={false}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Toplam Gelir"
            value={formatCurrency(stats.total_revenue)}
            icon={CurrencyDollarIcon}
            color="bg-green-500"
          />
          <StatCard
            title="Toplam Sipariş"
            value={stats.total_bookings}
            icon={ShoppingBagIcon}
            color="bg-blue-500"
          />
          <StatCard
            title="Toplam Müşteri"
            value={stats.total_customers}
            icon={UsersIcon}
            color="bg-purple-500"
          />
          <StatCard
            title="Ortalama Sipariş Değeri"
            value={formatCurrency(stats.average_order_value)}
            icon={ChartBarIcon}
            color="bg-orange-500"
          />
        </div>

        {/* Order Status Summary */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sipariş Durumu Özeti
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed_bookings}
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-sm text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending_bookings}
              </p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-sm text-gray-600">İptal Edilen</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.cancelled_bookings}
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Chart (Simple Table for now) */}
        {revenueData.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Gelir Trendi
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş Sayısı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gelir
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.map((data, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(data.date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.bookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(data.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => toast.success('PDF raporu hazırlanıyor...')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            PDF İndir
          </button>
          <button
            onClick={() => toast.success('Excel raporu hazırlanıyor...')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Excel İndir
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import FilterSelect, { STATUS_FILTER_OPTIONS } from '@/components/FilterSelect';

interface Booking {
  id: string; // UUID
  booking_number: string;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  status: string;
  pickup_date: string;
  pickup_address_details: {
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

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  bookingId: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Onaylandı', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'İşlemde', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'İptal', color: 'bg-red-100 text-red-800' },
];

function StatusDropdown({ value, onChange, bookingId }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = STATUS_OPTIONS.find(opt => opt.value === value) || STATUS_OPTIONS[0];

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          selectedOption.color
        } hover:opacity-80 min-w-[110px]`}
      >
        <span>{selectedOption.label}</span>
        <ChevronDownIcon className={`h-3 w-3 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-[100] mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 max-h-60 overflow-y-auto">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                option.value === value ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              <span className={`inline-block px-2 py-0.5 rounded-full ${option.color}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
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

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await apiClient.patch(`/admin/bookings/${bookingId}/`, { status: newStatus });
      if (response.success) {
        // Update only the specific booking in state instead of refetching all
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: newStatus }
              : booking
          )
        );
        toast.success('Sipariş durumu güncellendi');
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleExportPDF = async (bookingId: string) => {
    try {
      // Fetch full booking details
      const response = await apiClient.get(`/admin/bookings/${bookingId}/`);
      if (!response.success || !response.data) {
        toast.error('Sipariş detayları alınamadı');
        return;
      }

      const booking = response.data;

      // Create a new window with detailed A4 PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up engelleyici nedeniyle açılamadı');
        return;
      }

      // Generate detailed HTML for A4 PDF with all order information
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Sipariş #${booking.booking_number || booking.id}</title>
          <style>
            @page { margin: 15mm; size: A4; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 9px; color: #1f2937; line-height: 1.3; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 10px; }
            .header h1 { font-size: 16px; color: #1e40af; margin-bottom: 3px; }
            .header .info { font-size: 8px; color: #6b7280; }
            .status { display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 8px; font-weight: 600; margin-left: 8px; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-confirmed { background-color: #dbeafe; color: #1e40af; }
            .status-in_progress { background-color: #e9d5ff; color: #6b21a8; }
            .status-completed { background-color: #d1fae5; color: #065f46; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
            .section { background: #f9fafb; padding: 6px; border-radius: 3px; }
            .section-title { font-size: 9px; font-weight: bold; color: #374151; margin-bottom: 4px; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; }
            .label { font-size: 7px; color: #6b7280; margin-top: 3px; }
            .value { font-size: 8px; color: #1f2937; font-weight: 500; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8px; }
            .items-table th { background: #f3f4f6; padding: 3px 4px; text-align: left; font-size: 8px; font-weight: 600; border-bottom: 1px solid #d1d5db; }
            .items-table td { padding: 3px 4px; border-bottom: 1px solid #e5e7eb; }
            .items-table tr:last-child td { border-bottom: none; }
            .notes { background: #fef3c7; border-left: 2px solid #f59e0b; padding: 5px; margin-bottom: 6px; border-radius: 2px; }
            .notes h4 { font-size: 8px; font-weight: 600; color: #92400e; margin-bottom: 2px; }
            .notes p { font-size: 8px; color: #78350f; }
            .total-section { background: #f9fafb; padding: 6px; border-radius: 3px; margin-bottom: 8px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 8px; }
            .total-row.final { font-size: 11px; font-weight: bold; color: #1e40af; padding-top: 4px; border-top: 2px solid #2563eb; margin-top: 4px; }
            .footer { margin-top: 10px; padding-top: 6px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 7px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sipariş Detayı #${booking.booking_number || booking.id}</h1>
            <div class="info">
              Oluşturma: ${new Date(booking.created_at).toLocaleString('tr-TR')}
              <span class="status status-${booking.status}">${getStatusLabel(booking.status)}</span>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">👤 Müşteri Bilgileri</div>
              <div class="label">Ad Soyad</div>
              <div class="value">${booking.user_details?.first_name || ''} ${booking.user_details?.last_name || ''}</div>
              <div class="label">E-posta</div>
              <div class="value">${booking.user_details?.email || '-'}</div>
              <div class="label">Telefon</div>
              <div class="value">${booking.user_details?.phone || '-'}</div>
            </div>

            <div class="section">
              <div class="section-title">💳 Ödeme Bilgileri</div>
              <div class="label">Ödeme Yöntemi</div>
              <div class="value">${booking.payment_method === 'cash' ? 'Nakit' : booking.payment_method === 'card' ? 'Kredi Kartı' : booking.payment_method || '-'}</div>
              <div class="label">Ödeme Durumu</div>
              <div class="value">${booking.payment_status === 'paid' ? 'Ödendi ✓' : booking.payment_status === 'pending' ? 'Bekliyor' : booking.payment_status || '-'}</div>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">📍 Alım Bilgileri</div>
              <div class="label">Adres Başlığı</div>
              <div class="value">${booking.pickup_address_details?.title || '-'}</div>
              <div class="label">Tam Adres</div>
              <div class="value">${booking.pickup_address_details?.full_address || '-'}</div>
              <div class="label">İlçe</div>
              <div class="value">${booking.pickup_address_details?.district_details?.name || '-'}</div>
              <div class="label">Tarih ve Saat</div>
              <div class="value">${new Date(booking.pickup_date).toLocaleDateString('tr-TR')}${booking.pickup_time_slot ? ` | ${booking.pickup_time_slot.start_time} - ${booking.pickup_time_slot.end_time}` : ''}</div>
            </div>

            ${booking.delivery_address_details ? `
            <div class="section">
              <div class="section-title">🚚 Teslimat Bilgileri</div>
              <div class="label">Adres Başlığı</div>
              <div class="value">${booking.delivery_address_details.title || '-'}</div>
              <div class="label">Tam Adres</div>
              <div class="value">${booking.delivery_address_details.full_address || '-'}</div>
              <div class="label">İlçe</div>
              <div class="value">${booking.delivery_address_details.district_details?.name || '-'}</div>
              ${booking.delivery_date ? `
              <div class="label">Tarih ve Saat</div>
              <div class="value">${new Date(booking.delivery_date).toLocaleDateString('tr-TR')}${booking.delivery_time_slot ? ` | ${booking.delivery_time_slot.start_time} - ${booking.delivery_time_slot.end_time}` : ''}</div>
              ` : ''}
            </div>
            ` : '<div></div>'}
          </div>

          ${booking.items && booking.items.length > 0 ? `
          <div style="margin-bottom: 8px;">
            <div style="font-size: 10px; font-weight: bold; color: #374151; margin-bottom: 4px; border-bottom: 2px solid #e5e7eb; padding-bottom: 2px;">🧺 Sipariş Kalemleri</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Hizmet</th>
                  <th>Kategori</th>
                  <th>Alt Tip</th>
                  <th style="text-align: right;">Adet</th>
                  <th style="text-align: right;">Birim</th>
                  <th style="text-align: right;">Toplam</th>
                </tr>
              </thead>
              <tbody>
                ${booking.items.map((item: any) => `
                  <tr>
                    <td>${item.service_details?.name || '-'}</td>
                    <td>${item.category_details?.name || '-'}</td>
                    <td>${item.subtype_details?.name || '-'}</td>
                    <td style="text-align: right;">${item.quantity}</td>
                    <td style="text-align: right;">${parseFloat(item.unit_price || '0').toFixed(2)} ${booking.currency || 'TRY'}</td>
                    <td style="text-align: right; font-weight: 600;">${parseFloat(item.total_price || '0').toFixed(2)} ${booking.currency || 'TRY'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${booking.customer_notes || booking.admin_notes ? `
          <div style="margin-bottom: 8px;">
            ${booking.customer_notes ? `
            <div class="notes">
              <h4>📝 Müşteri Notları:</h4>
              <p>${booking.customer_notes}</p>
            </div>
            ` : ''}
            ${booking.admin_notes ? `
            <div class="notes" style="background: #dbeafe; border-left-color: #2563eb;">
              <h4 style="color: #1e40af;">🔒 Admin Notları:</h4>
              <p style="color: #1e3a8a;">${booking.admin_notes}</p>
            </div>
            ` : ''}
          </div>
          ` : ''}

          <div class="total-section">
            ${booking.subtotal ? `
            <div class="total-row">
              <span>Ara Toplam:</span>
              <span>${parseFloat(booking.subtotal).toFixed(2)} ${booking.currency || 'TRY'}</span>
            </div>
            ` : ''}
            ${booking.discount_amount && parseFloat(booking.discount_amount) > 0 ? `
            <div class="total-row" style="color: #dc2626;">
              <span>İndirim:</span>
              <span>-${parseFloat(booking.discount_amount).toFixed(2)} ${booking.currency || 'TRY'}</span>
            </div>
            ` : ''}
            ${booking.tax_amount && parseFloat(booking.tax_amount) > 0 ? `
            <div class="total-row">
              <span>KDV (${booking.tax_rate || 0}%):</span>
              <span>${parseFloat(booking.tax_amount).toFixed(2)} ${booking.currency || 'TRY'}</span>
            </div>
            ` : ''}
            <div class="total-row final">
              <span>GENEL TOPLAM:</span>
              <span>${parseFloat(booking.total || '0').toFixed(2)} ${booking.currency || 'TRY'}</span>
            </div>
          </div>

          <div class="footer">
            <div>Yazdırma Tarihi: ${new Date().toLocaleString('tr-TR')} | Bu belge elektronik olarak oluşturulmuştur.</div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 100);
              }, 300);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      toast.success('PDF oluşturuluyor...');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('PDF oluşturulamadı');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Bekliyor',
      confirmed: 'Onaylandı',
      in_progress: 'İşlemde',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#fef3c7',
      confirmed: '#dbeafe',
      in_progress: '#e9d5ff',
      completed: '#d1fae5',
      cancelled: '#fee2e2',
    };
    return colors[status] || '#f3f4f6';
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
    
    const customerName = booking.user_details 
      ? `${booking.user_details.first_name} ${booking.user_details.last_name}`.toLowerCase()
      : '';
    const customerEmail = booking.user_details?.email?.toLowerCase() || '';
    const customerPhone = booking.user_details?.phone || '';
    
    return (
      booking.id.toString().includes(searchLower) ||
      booking.booking_number.toLowerCase().includes(searchLower) ||
      customerName.includes(searchLower) ||
      customerEmail.includes(searchLower) ||
      customerPhone.includes(searchTerm)
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

      {/* Orders Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-visible">
        <div className="w-full overflow-visible">
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
                      <div className="text-sm font-medium text-gray-900">#{booking.booking_number || booking.id}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.user_details ? (
                        <>
                          <Link
                            href={`/admin/customers/${booking.user_details.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {booking.user_details.first_name} {booking.user_details.last_name}
                          </Link>
                          <div className="text-xs text-gray-500">{booking.user_details.email}</div>
                          {booking.user_details.phone && (
                            <a
                              href={`tel:${booking.user_details.phone}`}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                            >
                              📞 {booking.user_details.phone}
                            </a>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Müşteri bilgisi yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.pickup_address_details?.title || 'Adres bilgisi yok'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.pickup_address_details?.district_details?.name || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.pickup_date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {booking.total} {booking.currency}
                    </td>
                    <td className="px-6 py-4 relative">
                      <StatusDropdown
                        value={booking.status}
                        onChange={(newStatus) => handleStatusChange(booking.id, newStatus)}
                        bookingId={booking.id}
                      />
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

      {/* Orders Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">#{booking.booking_number || booking.id}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(booking.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              {/* Customer */}
              {booking.user_details && (
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Müşteri</p>
                  <Link
                    href={`/admin/customers/${booking.user_details.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {booking.user_details.first_name} {booking.user_details.last_name}
                  </Link>
                  {booking.user_details.phone && (
                    <a
                      href={`tel:${booking.user_details.phone}`}
                      className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-1 block"
                    >
                      📞 {booking.user_details.phone}
                    </a>
                  )}
                </div>
              )}

              {/* Address & Date */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Adres</p>
                  <p className="text-sm text-gray-900">{booking.pickup_address_details?.title || 'Adres bilgisi yok'}</p>
                  {booking.pickup_address_details?.district_details?.name && (
                    <p className="text-xs text-gray-500">{booking.pickup_address_details.district_details.name}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Alım Tarihi</p>
                  <p className="text-sm text-gray-900">{new Date(booking.pickup_date).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Tutar</p>
                <p className="text-lg font-bold text-gray-900">{booking.total} {booking.currency}</p>
              </div>

              {/* Status Selector */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Durum Değiştir</p>
                <StatusDropdown
                  value={booking.status}
                  onChange={(newStatus) => handleStatusChange(booking.id, newStatus)}
                  bookingId={booking.id}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/orders/${booking.id}`}
                  className="flex-1 text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Detay Gör
                </Link>
                <button
                  onClick={() => handleExportPDF(booking.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  title="PDF olarak indir"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz sipariş bulunmuyor'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

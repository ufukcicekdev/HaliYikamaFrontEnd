'use client';
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PrinterIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface BookingDetail {
  id: string; // UUID
  booking_number: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  status: string;
  pickup_date: string;
  pickup_time_slot?: {
    start_time: string;
    end_time: string;
  };
  pickup_address_details?: {
    title: string;
    full_address: string;
    district_details?: {
      name: string;
    };
  };
  delivery_address_details?: {
    title: string;
    full_address: string;
  };
  items?: Array<{
    id: number;
    subtype_details?: {
      name: string;
      category?: {
        name: string;
      };
    };
    quantity: number;
    unit_price: string;
    line_total: string;
    notes: string;
  }>;
  subtotal?: string;
  delivery_fee?: string;
  discount?: string;
  total: string;
  currency: string;
  customer_notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export default function OrderDetailPage() {
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
      const response = await apiClient.get(`/admin/bookings/${params.id}/`);
      console.log('📦 Booking detail response:', response);
      console.log('📦 Booking data:', response.data);
      if (response.success && response.data) {
        setBooking(response.data);
        console.log('✅ Booking set to state:', response.data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Sipariş detayı yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!booking) return;

    console.log('🖨️ Printing booking:', booking);
    console.log('👤 User data:', booking.user);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up engelleyici nedeniyle açılamadı');
      return;
    }

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

    // Get customer info - prioritize user_details from backend
    const customer = booking.user_details || booking.user;
    const customerName = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '-';
    const customerEmail = customer?.email || '-';
    const customerPhone = customer?.phone || '-';

    console.log('👥 Customer for PDF:', { customer, customerName, customerEmail, customerPhone });

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
            <div class="value">${customerName}</div>
            <div class="label">E-posta</div>
            <div class="value">${customerEmail}</div>
            <div class="label">Telefon</div>
            <div class="value">${customerPhone}</div>
          </div>

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
        </div>

        ${booking.items && booking.items.length > 0 ? `
        <div style="margin-bottom: 8px;">
          <div style="font-size: 10px; font-weight: bold; color: #374151; margin-bottom: 4px; border-bottom: 2px solid #e5e7eb; padding-bottom: 2px;">🧺 Sipariş Kalemleri</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Hizmet</th>
                <th>Kategori</th>
                <th style="text-align: right;">Adet</th>
                <th style="text-align: right;">Birim</th>
                <th style="text-align: right;">Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${booking.items.map((item: any) => `
                <tr>
                  <td>${item.subtype_details?.name || '-'}</td>
                  <td>${item.subtype_details?.category?.name || '-'}</td>
                  <td style="text-align: right;">${item.quantity}</td>
                  <td style="text-align: right;">${parseFloat(item.unit_price || '0').toFixed(2)} ${booking.currency}</td>
                  <td style="text-align: right; font-weight: 600;">${parseFloat(item.line_total || '0').toFixed(2)} ${booking.currency}</td>
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
            <span>${parseFloat(booking.subtotal).toFixed(2)} ${booking.currency}</span>
          </div>
          ` : ''}
          ${booking.delivery_fee && parseFloat(booking.delivery_fee) > 0 ? `
          <div class="total-row">
            <span>Teslimat Ücreti:</span>
            <span>${parseFloat(booking.delivery_fee).toFixed(2)} ${booking.currency}</span>
          </div>
          ` : ''}
          ${booking.discount && parseFloat(booking.discount) > 0 ? `
          <div class="total-row" style="color: #dc2626;">
            <span>İndirim:</span>
            <span>-${parseFloat(booking.discount).toFixed(2)} ${booking.currency}</span>
          </div>
          ` : ''}
          <div class="total-row final">
            <span>GENEL TOPLAM:</span>
            <span>${parseFloat(booking.total || '0').toFixed(2)} ${booking.currency}</span>
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
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: 'Bekliyor', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Onaylandı', className: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'İşlemde', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Tamamlandı', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'İptal Edildi', className: 'bg-red-100 text-red-800' },
    };
    const c = config[status] || config.pending;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.className}`}>{c.label}</span>;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (!booking) {
    return <div className="text-center py-12"><p className="text-gray-500">Sipariş bulunamadı</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sipariş #{booking.booking_number || booking.id}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(booking.created_at).toLocaleString('tr-TR')} tarihinde oluşturuldu
            </p>
          </div>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <PrinterIcon className="h-5 w-5" />
          Yazdır
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Alım Tarihi</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{new Date(booking.pickup_date).toLocaleDateString('tr-TR')}</dd>
              </div>
              {booking.pickup_time_slot && (
                <div>
                  <dt className="text-sm text-gray-600">Alım Saati</dt>
                  <dd className="text-sm font-medium text-gray-900 mt-1">
                    {booking.pickup_time_slot.start_time} - {booking.pickup_time_slot.end_time}
                  </dd>
                </div>
              )}
              <div className="col-span-2">
                <dt className="text-sm text-gray-600">Durum</dt>
                <dd className="mt-1">{getStatusBadge(booking.status)}</dd>
              </div>
            </dl>
          </div>

          {/* Items */}
          {booking.items && booking.items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Kalemleri</h2>
              <div className="space-y-3">
                {booking.items.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.subtype_details?.name || 'Hizmet'}</p>
                        {item.subtype_details?.category?.name && (
                          <p className="text-xs text-gray-500">{item.subtype_details.category.name}</p>
                        )}
                        {item.notes && <p className="text-xs text-gray-500 italic mt-1">{item.notes}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{item.line_total} {booking.currency}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x {item.unit_price} {booking.currency}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Address Info */}
          {booking.pickup_address_details && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Alım Adresi
              </h2>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">{booking.pickup_address_details.title}</p>
                <p className="text-sm text-gray-700">{booking.pickup_address_details.full_address}</p>
                {booking.pickup_address_details.district_details?.name && (
                  <p className="text-sm text-gray-600">{booking.pickup_address_details.district_details.name}</p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {(booking.customer_notes || booking.admin_notes) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notlar</h2>
              {booking.customer_notes && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Müşteri Notu:</p>
                  <p className="text-sm text-gray-700">{booking.customer_notes}</p>
                </div>
              )}
              {booking.admin_notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Admin Notu:</p>
                  <p className="text-sm text-gray-700">{booking.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          {(booking.user_details || booking.user) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h2>
              <div className="space-y-3">
                {(() => {
                  const customer = booking.user_details || booking.user;
                  if (!customer) return null;
                  return (
                    <>
                      <Link href={`/admin/customers/${customer.id}`} className="block text-base font-medium text-blue-600 hover:text-blue-700">
                        {customer.first_name} {customer.last_name}
                      </Link>
                      {customer.email && (
                        <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                          <EnvelopeIcon className="h-4 w-4" />
                          {customer.email}
                        </a>
                      )}
                      {customer.phone && (
                        <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                          <PhoneIcon className="h-4 w-4" />
                          {customer.phone}
                        </a>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">Toplam Tutar</h2>
            {booking.subtotal && (
              <div className="text-sm mb-2 opacity-90">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span>{booking.subtotal} {booking.currency}</span>
                </div>
                {booking.delivery_fee && parseFloat(booking.delivery_fee) > 0 && (
                  <div className="flex justify-between">
                    <span>Teslimat:</span>
                    <span>{booking.delivery_fee} {booking.currency}</span>
                  </div>
                )}
                {booking.discount && parseFloat(booking.discount) > 0 && (
                  <div className="flex justify-between text-green-300">
                    <span>İndirim:</span>
                    <span>-{booking.discount} {booking.currency}</span>
                  </div>
                )}
              </div>
            )}
            <p className="text-4xl font-bold">{booking.total} {booking.currency}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

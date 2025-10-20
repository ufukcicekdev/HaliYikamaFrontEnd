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
      console.log('Booking detail response:', response);
      if (response.success && response.data) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Sipariş detayı yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
          {booking.user && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h2>
              <div className="space-y-3">
                <Link href={`/admin/customers/${booking.user.id}`} className="block text-base font-medium text-blue-600 hover:text-blue-700">
                  {booking.user.first_name} {booking.user.last_name}
                </Link>
                <a href={`mailto:${booking.user.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                  <EnvelopeIcon className="h-4 w-4" />
                  {booking.user.email}
                </a>
                {booking.user.phone && (
                  <a href={`tel:${booking.user.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    <PhoneIcon className="h-4 w-4" />
                    {booking.user.phone}
                  </a>
                )}
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

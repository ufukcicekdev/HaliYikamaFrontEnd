'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PrinterIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface BookingDetail {
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
    building_no: string;
    apartment_no: string;
    floor: string;
    notes: string;
  };
  notes: string;
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
            <h1 className="text-3xl font-bold text-gray-900">Sipariş #{booking.id}</h1>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hizmet Bilgileri</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Kategori</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{booking.category_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Hizmet</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{booking.service_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Tarih</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{new Date(booking.scheduled_date).toLocaleDateString('tr-TR')}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Saat</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{booking.scheduled_time}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-gray-600">Durum</dt>
                <dd className="mt-1">{getStatusBadge(booking.status)}</dd>
              </div>
            </dl>
          </div>

          {/* Address Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Adres Bilgileri
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{booking.address.title}</p>
              <p className="text-sm text-gray-700">{booking.address.address_line}</p>
              <p className="text-sm text-gray-600">{booking.address.district_name}</p>
              {(booking.address.building_no || booking.address.apartment_no || booking.address.floor) && (
                <p className="text-sm text-gray-600">
                  {booking.address.building_no && `Bina: ${booking.address.building_no}`}
                  {booking.address.apartment_no && ` • Daire: ${booking.address.apartment_no}`}
                  {booking.address.floor && ` • Kat: ${booking.address.floor}`}
                </p>
              )}
              {booking.address.notes && (
                <p className="text-xs text-gray-500 italic mt-2">{booking.address.notes}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notlar</h2>
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h2>
            <div className="space-y-3">
              <Link href={`/admin/customers/${booking.customer.id}`} className="block text-base font-medium text-blue-600 hover:text-blue-700">
                {booking.customer.first_name} {booking.customer.last_name}
              </Link>
              <a href={`mailto:${booking.customer.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                <EnvelopeIcon className="h-4 w-4" />
                {booking.customer.email}
              </a>
              {booking.customer.phone && (
                <a href={`tel:${booking.customer.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  <PhoneIcon className="h-4 w-4" />
                  {booking.customer.phone}
                </a>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">Toplam Tutar</h2>
            <p className="text-4xl font-bold">{booking.total_price} ₺</p>
          </div>
        </div>
      </div>
    </div>
  );
}

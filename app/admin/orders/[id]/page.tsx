'use client';
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PrinterIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });
      
      // Set font to helvetica which has better unicode support
      doc.setFont('helvetica');
      
      const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
          pending: 'Bekliyor',
          confirmed: 'Onaylandi',
          in_progress: 'Islemde',
          completed: 'Tamamlandi',
          cancelled: 'Iptal Edildi',
        };
        return labels[status] || status;
      };

      // Get customer info - prioritize user_details from backend
      const customer = booking.user_details || booking.user;
      const customerName = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '-';
      const customerEmail = customer?.email || '-';
      const customerPhone = customer?.phone || '-';

      let yPos = 20;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175);
      doc.text(`Siparis #${booking.booking_number || booking.id}`, 105, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Olusturulma: ${new Date(booking.created_at).toLocaleString('tr-TR')} | Durum: ${getStatusLabel(booking.status)}`, 105, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;

      // Customer Info Section
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text('Musteri Bilgileri', 20, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      doc.text(`Ad Soyad: ${customerName}`, 20, yPos);
      yPos += 5;
      doc.text(`E-posta: ${customerEmail}`, 20, yPos);
      yPos += 5;
      doc.text(`Telefon: ${customerPhone}`, 20, yPos);
      yPos += 10;

      // Pickup Address Section
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text('Alim Bilgileri', 20, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      doc.text(`Adres: ${booking.pickup_address_details?.title || '-'}`, 20, yPos);
      yPos += 5;
      
      const fullAddress = booking.pickup_address_details?.full_address || '-';
      const addressLines = doc.splitTextToSize(fullAddress, 170);
      doc.text(addressLines, 20, yPos);
      yPos += addressLines.length * 5;
      
      doc.text(`Ilce: ${booking.pickup_address_details?.district_details?.name || '-'}`, 20, yPos);
      yPos += 5;
      
      const pickupDate = new Date(booking.pickup_date).toLocaleDateString('tr-TR');
      const timeSlot = booking.pickup_time_slot ? ` ${booking.pickup_time_slot.start_time} - ${booking.pickup_time_slot.end_time}` : '';
      doc.text(`Tarih ve Saat: ${pickupDate}${timeSlot}`, 20, yPos);
      yPos += 10;

      // Items Table
      if (booking.items && booking.items.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.text('Siparis Kalemleri', 20, yPos);
        yPos += 5;

        const tableData = booking.items.map(item => [
          item.subtype_details?.name || 'Hizmet',
          item.subtype_details?.category?.name || '-',
          item.quantity.toString(),
          `${parseFloat(item.unit_price).toFixed(2)} ${booking.currency}`,
          `${parseFloat(item.line_total).toFixed(2)} ${booking.currency}`,
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Hizmet', 'Kategori', 'Adet', 'Birim Fiyat', 'Toplam']],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [37, 99, 235], 
            fontSize: 9,
            font: 'helvetica'
          },
          bodyStyles: { 
            fontSize: 8,
            font: 'helvetica'
          },
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right', fontStyle: 'bold' },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Notes Section
      if (booking.customer_notes || booking.admin_notes) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.text('Notlar', 20, yPos);
        yPos += 6;

        doc.setFontSize(9);
        if (booking.customer_notes) {
          doc.setTextColor(120, 53, 15);
          doc.text('Musteri Notu:', 20, yPos);
          yPos += 5;
          const noteLines = doc.splitTextToSize(booking.customer_notes, 170);
          doc.text(noteLines, 20, yPos);
          yPos += noteLines.length * 5 + 3;
        }

        if (booking.admin_notes) {
          doc.setTextColor(30, 58, 138);
          doc.text('Admin Notu:', 20, yPos);
          yPos += 5;
          const noteLines = doc.splitTextToSize(booking.admin_notes, 170);
          doc.text(noteLines, 20, yPos);
          yPos += noteLines.length * 5 + 3;
        }

        yPos += 5;
      }

      // Total Section
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text('Odeme Ozeti', 20, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      
      if (booking.subtotal) {
        doc.text(`Ara Toplam:`, 20, yPos);
        doc.text(`${parseFloat(booking.subtotal).toFixed(2)} ${booking.currency}`, 190, yPos, { align: 'right' });
        yPos += 5;
      }

      if (booking.delivery_fee && parseFloat(booking.delivery_fee) > 0) {
        doc.text(`Teslimat Ucreti:`, 20, yPos);
        doc.text(`${parseFloat(booking.delivery_fee).toFixed(2)} ${booking.currency}`, 190, yPos, { align: 'right' });
        yPos += 5;
      }

      if (booking.discount && parseFloat(booking.discount) > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text(`Indirim:`, 20, yPos);
        doc.text(`-${parseFloat(booking.discount).toFixed(2)} ${booking.currency}`, 190, yPos, { align: 'right' });
        yPos += 5;
      }

      yPos += 2;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.3);
      doc.line(20, yPos, 190, yPos);
      yPos += 6;

      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text(`GENEL TOPLAM:`, 20, yPos);
      doc.text(`${parseFloat(booking.total || '0').toFixed(2)} ${booking.currency}`, 190, yPos, { align: 'right' });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`Bu belge ${new Date().toLocaleString('tr-TR')} tarihinde otomatik olarak olusturulmustur.`, 105, 285, { align: 'center' });

      // Download PDF
      doc.save(`Siparis_${booking.booking_number || booking.id}.pdf`);
      toast.success('PDF indirildi');
      
    } catch (error) {
      console.error('PDF olusturma hatasi:', error);
      toast.error('PDF olusturulamadi');
    }
  };

  const handlePreview = () => {
    if (!booking) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });
      
      // Set font to helvetica
      doc.setFont('helvetica');
      
      const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
          pending: 'Bekliyor',
          confirmed: 'Onaylandi',
          in_progress: 'Islemde',
          completed: 'Tamamlandi',
          cancelled: 'Iptal Edildi',
        };
        return labels[status] || status;
      };

      // Get customer info - prioritize user_details from backend
      const customer = booking.user_details || booking.user;
      const customerName = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '-';
      const customerEmail = customer?.email || '-';
      const customerPhone = customer?.phone || '-';

      let yPos = 20;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175);
      doc.text(`Siparis #${booking.booking_number || booking.id}`, 105, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Olusturulma: ${new Date(booking.created_at).toLocaleString('tr-TR')} | Durum: ${getStatusLabel(booking.status)}`, 105, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;

      // Customer Info Section
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text('Musteri Bilgileri', 20, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      doc.text(`Ad Soyad: ${customerName}`, 20, yPos);
      yPos += 5;
      doc.text(`E-posta: ${customerEmail}`, 20, yPos);
      yPos += 5;
      doc.text(`Telefon: ${customerPhone}`, 20, yPos);
      yPos += 10;

      // Pickup Address Section
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text('Alim Bilgileri', 20, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      doc.text(`Adres: ${booking.pickup_address_details?.title || '-'}`, 20, yPos);
      yPos += 5;
      
      const fullAddress = booking.pickup_address_details?.full_address || '-';
      const addressLines = doc.splitTextToSize(fullAddress, 170);
      doc.text(addressLines, 20, yPos);
      yPos += addressLines.length * 5;
      
      doc.text(`Ilce: ${booking.pickup_address_details?.district_details?.name || '-'}`, 20, yPos);
      yPos += 5;
      
      const pickupDate = new Date(booking.pickup_date).toLocaleDateString('tr-TR');
      const timeSlot = booking.pickup_time_slot ? ` ${booking.pickup_time_slot.start_time} - ${booking.pickup_time_slot.end_time}` : '';
      doc.text(`Tarih ve Saat: ${pickupDate}${timeSlot}`, 20, yPos);
      yPos += 10;

      // Items Table
      if (booking.items && booking.items.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.text('Siparis Kalemleri', 20, yPos);
        yPos += 5;

        const tableData = booking.items.map(item => [
          item.subtype_details?.name || 'Hizmet',
          item.subtype_details?.category?.name || '-',
          item.quantity.toString(),
          `${parseFloat(item.unit_price).toFixed(2)} ${booking.currency}`,
          `${parseFloat(item.line_total).toFixed(2)} ${booking.currency}`,
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Hizmet', 'Kategori', 'Adet', 'Birim Fiyat', 'Toplam']],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [37, 99, 235], 
            fontSize: 9,
            font: 'helvetica'
          },
          bodyStyles: { 
            fontSize: 8,
            font: 'helvetica'
          },
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right', fontStyle: 'bold' },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Notes Section
      if (booking.customer_notes || booking.admin_notes) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.text('Notlar', 20, yPos);
        yPos += 6;

        doc.setFontSize(9);
        if (booking.customer_notes) {
          doc.setTextColor(120, 53, 15);
          doc.text('Musteri Notu:', 20, yPos);
          yPos += 5;
          const noteLines = doc.splitTextToSize(booking.customer_notes, 170);
          doc.text(noteLines, 20, yPos);
          yPos += noteLines.length * 5 + 3;
        }

        if (booking.admin_notes) {
          doc.setTextColor(30, 58, 138);
          doc.text('Admin Notu:', 20, yPos);
          yPos += 5;
          const noteLines = doc.splitTextToSize(booking.admin_notes, 170);
          doc.text(noteLines, 20, yPos);
          yPos += noteLines.length * 5 + 3;
        }

        yPos += 5;
      }

      // Total Section
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text('Odeme Ozeti', 20, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      
      if (booking.subtotal) {
        doc.text(`Ara Toplam:`, 20, yPos);
        doc.text(`${parseFloat(booking.subtotal).toFixed(2)} ${booking.currency}`, 190, yPos, { align: 'right' });
        yPos += 5;
      }

      if (booking.delivery_fee && parseFloat(booking.delivery_fee) > 0) {
        doc.text(`Teslimat Ucreti:`, 20, yPos);
        doc.text(`${parseFloat(booking.delivery_fee).toFixed(2)} ${booking.currency}`, 190, yPos, { align: 'right' });
        yPos += 5;
      }

      if (booking.discount && parseFloat(booking.discount) > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text(`Indirim:`, 20, yPos);
        doc.text(`-${parseFloat(booking.discount).toFixed(2)} ${booking.currency}`, 190, yPos, { align: 'right' });
        yPos += 5;
      }

      yPos += 2;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.3);
      doc.line(20, yPos, 190, yPos);
      yPos += 6;

      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text(`GENEL TOPLAM:`, 20, yPos);
      doc.text(`${parseFloat(booking.total || '0').toFixed(2)} ${booking.currency}`, 190, yPos, { align: 'right' });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`Bu belge ${new Date().toLocaleString('tr-TR')} tarihinde otomatik olarak olusturulmustur.`, 105, 285, { align: 'center' });

      // Open PDF in modal for preview
      const pdfBlob = doc.output('blob');
      const pdfObjectUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfObjectUrl);
      setShowPdfModal(true);
      toast.success('On izleme aciliyor...');
      
    } catch (error) {
      console.error('PDF on izleme hatasi:', error);
      toast.error('On izleme olusturulamadi');
    }
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
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePreview} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <EyeIcon className="h-5 w-5" />
            Ön İzle
          </button>
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PrinterIcon className="h-5 w-5" />
            PDF İndir
          </button>
        </div>
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

      {/* PDF Preview Modal */}
      {showPdfModal && pdfUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => {
                setShowPdfModal(false);
                if (pdfUrl) {
                  URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
                }
              }}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              {/* Header */}
              <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  PDF On Izleme - Siparis #{booking.booking_number || booking.id}
                </h3>
                <button
                  onClick={() => {
                    setShowPdfModal(false);
                    if (pdfUrl) {
                      URL.revokeObjectURL(pdfUrl);
                      setPdfUrl(null);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* PDF Viewer */}
              <div className="bg-gray-100 p-4" style={{ height: '80vh' }}>
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0 rounded-lg shadow-lg"
                  title="PDF Preview"
                />
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:w-auto sm:text-sm"
                >
                  PDF Indir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPdfModal(false);
                    if (pdfUrl) {
                      URL.revokeObjectURL(pdfUrl);
                      setPdfUrl(null);
                    }
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

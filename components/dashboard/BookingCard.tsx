'use client';

import { Booking } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onReorder?: (id: string) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function BookingCard({
  booking,
  onCancel,
  onReschedule,
  onReorder,
}: BookingCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {booking.booking_number}
          </h3>
          <p className="text-sm text-gray-500">
            {format(new Date(booking.pickup_date), 'MMMM dd, yyyy')}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
          {booking.status_display}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-600">{booking.pickup_address_details.district_name}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-gray-600">{booking.items.length} item(s)</span>
        </div>
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Toplam</span>
          <span className="text-lg font-semibold text-gray-900">
            {booking.total} {booking.currency}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/dashboard/bookings/${booking.id}`}
          className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Detayları Gör
        </Link>

        {booking.status === 'completed' && onReorder && (
          <button
            onClick={() => onReorder(booking.id)}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Tekrar Sipariş Ver
          </button>
        )}

        {booking.can_reschedule && onReschedule && (
          <button
            onClick={() => onReschedule(booking.id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Yeniden Planla
          </button>
        )}

        {booking.can_cancel && onCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            İptal Et
          </button>
        )}
      </div>

      {!booking.can_cancel && booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          {booking.cancellation_info.message}
        </p>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { 
  BellIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'success',
      title: 'Rezervasyon Onaylandı',
      message: 'Halı temizleme hizmeti için yaptığınız rezervasyon onaylandı.',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      type: 'info',
      title: 'Yeni Kampanya',
      message: 'Koltuk temizliğinde %20 indirim! Hemen rezervasyon yapın.',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
        <p className="mt-1 text-sm text-gray-600">
          Son güncellemeler ve bildirimler
        </p>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${getBackgroundColor(notification.type)} ${
                notification.is_read ? 'opacity-60' : ''
              } rounded-lg p-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                        {!notification.is_read && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Yeni
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Bildirim yok</h3>
          <p className="mt-1 text-sm text-gray-500">
            Yeni bildirimleriniz burada görünecek
          </p>
        </div>
      )}
    </div>
  );
}

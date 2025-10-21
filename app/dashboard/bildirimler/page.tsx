'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNotificationStore, Notification } from '@/lib/store/notification-store';

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const { notifications, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/customer/notifications/');
      
      if (response.success && response.data) {
        const notificationData = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        setNotifications(notificationData);
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast.error('Bildirimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    markAsRead(id);
    try {
      await apiClient.patch(`/customer/notifications/${id}/`, { is_read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    markAllAsRead();
    try {
      await apiClient.post('/customer/notifications/mark_all_read/');
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await apiClient.delete(`/customer/notifications/${id}/`);
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success('Bildirim silindi');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Bildirim silinemedi');
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.is_read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_confirmed':
        return '✅';
      case 'order_in_progress':
        return '🔄';
      case 'order_completed':
        return '✨';
      case 'order_cancelled':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
            <p className="mt-1 text-sm text-gray-600">
              Tüm bildirimlerinizi görüntüleyin
            </p>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckIcon className="h-4 w-4" />
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Tümü ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === 'unread'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Okunmamış ({notifications.filter((n) => !n.is_read).length})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border transition-all ${
                  !notification.is_read
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3
                            className={`text-sm ${
                              !notification.is_read
                                ? 'font-semibold text-gray-900'
                                : 'font-medium text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Okundu olarak işaretle"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {notification.booking_id && (
                        <button
                          onClick={() => router.push(`/dashboard/siparisler/${notification.booking_id}`)}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Siparişi Görüntüle →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'unread'
                  ? 'Okunmamış bildirim yok'
                  : 'Henüz bildirim yok'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { useNotificationStore } from '@/lib/store/notification-store';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth-store';

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [notificationSoundUrl, setNotificationSoundUrl] = useState<string | null>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    setNotifications,
    updateLastChecked,
  } = useNotificationStore();

  // Determine if user is admin
  const isAdmin = user?.user_type === 'admin';

  // Fetch notification sound URL from API
  useEffect(() => {
    const fetchNotificationSound = async () => {
      try {
        const response = await apiClient.get('/core/notification-sound/');
        console.log('Notification sound API response:', response);
        
        if (response.success && response.data) {
          const backendResponse = response.data as any;
          const soundUrl = backendResponse.data?.sound_url || null;
          
          console.log('Notification sound URL:', soundUrl);
          setNotificationSoundUrl(soundUrl);
        }
      } catch (error) {
        console.error('Error fetching notification sound:', error);
      }
    };
    
    fetchNotificationSound();
  }, []);

  // Initialize audio when sound URL is available
  useEffect(() => {
    if (notificationSoundUrl) {
      console.log('Initializing audio with URL:', notificationSoundUrl);
      try {
        audioRef.current = new Audio(notificationSoundUrl);
        
        // Preload the audio
        audioRef.current.load();
        
        // Add event listeners for debugging
        audioRef.current.addEventListener('canplaythrough', () => {
          console.log('✅ Audio can play through');
        });
        
        audioRef.current.addEventListener('error', (e) => {
          console.error('❌ Audio error:', e);
        });
        
        console.log('Audio initialized successfully');
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    }
  }, [notificationSoundUrl]);

  // Fetch notifications from API (admin or user endpoint based on user type)
  const fetchNotifications = async () => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return; // Don't fetch if not authenticated
    }
    
    try {
      // Use different endpoint based on user type
      const endpoint = isAdmin ? '/admin/notifications/' : '/customer/notifications/';
      const response = await apiClient.get(endpoint);
      if (response.success && response.data) {
        const newNotifications = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        
        // Check if there are new unread notifications
        const previousUnread = unreadCount;
        const currentUnread = newNotifications.filter((n: any) => !n.is_read).length;
        
        if (currentUnread > previousUnread) {
          // New notification arrived - play sound and animate
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
          
          // Play notification sound
          if (audioRef.current) {
            console.log('🔊 Attempting to play notification sound...');
            audioRef.current.currentTime = 0; // Reset to start
            audioRef.current.play()
              .then(() => {
                console.log('✅ Sound played successfully');
              })
              .catch((error) => {
                console.error('❌ Error playing sound:', error);
                console.log('This might be due to browser autoplay policy. User interaction required.');
              });
          } else {
            console.log('⚠️ Audio not initialized yet');
          }
        }
        
        setNotifications(newNotifications);
      }
    } catch (error) {
      // Silently fail - likely not authenticated
      console.error('Error fetching notifications:', error);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
      // Update on server (use correct endpoint)
      try {
        const endpoint = isAdmin 
          ? `/admin/notifications/${notification.id}/` 
          : `/customer/notifications/${notification.id}/`;
        await apiClient.patch(endpoint, {
          is_read: true,
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to booking if available - different routes for admin and customer
    if (notification.booking_id) {
      const orderUrl = isAdmin 
        ? `/admin/orders/${notification.booking_id}` 
        : `/dashboard/siparisler/${notification.booking_id}`;
      router.push(orderUrl);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    markAllAsRead();
    updateLastChecked();
    
    // Update on server (use correct endpoint)
    try {
      const endpoint = isAdmin 
        ? '/admin/notifications/mark_all_read/' 
        : '/customer/notifications/mark_all_read/';
      await apiClient.post(endpoint);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation(); // Prevent notification click
    
    try {
      const endpoint = isAdmin 
        ? `/admin/notifications/${notificationId}/` 
        : `/customer/notifications/${notificationId}/`;
      await apiClient.delete(endpoint);
      
      // Remove from local state
      setNotifications(notifications.filter((n) => n.id !== notificationId));
      toast.success('Bildirim silindi');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Bildirim silinemedi');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return '🆕';
      case 'cancelled_order':
        return '❌';
      case 'status_change':
      case 'order_confirmed':
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-700 hover:text-blue-600 transition-all ${
          isAnimating ? 'animate-bounce' : ''
        }`}
      >
        {unreadCount > 0 ? (
          <BellAlertIcon className="h-6 w-6 text-blue-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="fixed sm:absolute top-14 sm:top-auto right-2 sm:right-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm sm:max-w-none bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[80vh] sm:max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Bildirimler {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <CheckIcon className="h-3 w-3" />
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`w-full border-b border-gray-100 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleNotificationClick(notification)}
                          className="flex items-start gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                        >
                          <span className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm ${
                                  !notification.is_read
                                    ? 'font-semibold text-gray-900'
                                    : 'font-medium text-gray-700'
                                }`}
                              >
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                          title="Sil"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-12 text-center">
                  <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Henüz bildirim yok</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    const notificationsUrl = isAdmin 
                      ? '/admin/notifications' 
                      : '/dashboard/bildirimler';
                    router.push(notificationsUrl);
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tüm Bildirimleri Gör
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

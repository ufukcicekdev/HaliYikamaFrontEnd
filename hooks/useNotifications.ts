'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    [key: string]: string;
  };
}

export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  /**
   * Request notification permission and register FCM token
   */
  const enableNotifications = async () => {
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        setFcmToken(token);
        setNotificationPermission('granted');
        
        // Send token to backend
        await saveFCMToken(token);
        
        toast.success('Bildirimler etkinleştirildi');
        return token;
      } else {
        toast.error('Bildirim izni reddedildi');
        return null;
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Bildirimler etkinleştirilirken hata oluştu');
      return null;
    }
  };

  /**
   * Save FCM token to backend
   */
  const saveFCMToken = async (token: string) => {
    try {
      const response = await apiClient.post('/admin/notifications/fcm-token/', {
        token,
        device_type: 'web',
      });
      
      if (response.success) {
        console.log('FCM token saved to backend successfully');
      } else {
        console.error('Failed to save FCM token:', response.error);
        throw new Error(response.error?.message || 'Failed to save token');
      }
    } catch (error) {
      console.error('Error saving FCM token:', error);
      throw error;
    }
  };

  /**
   * Listen for foreground messages
   */
  useEffect(() => {
    if (notificationPermission === 'granted') {
      onMessageListener()
        .then((payload: any) => {
          const notification = payload as NotificationPayload;
          console.log('Foreground message received:', notification);
          
          // Show toast notification
          const title = notification.notification?.title || 'Yeni Bildirim';
          const body = notification.notification?.body || '';
          
          toast.success(`${title}${body ? '\n' + body : ''}`, {
            duration: 5000,
            icon: '🔔',
          });
          
          // Play notification sound if available
          playNotificationSound();
        })
        .catch((err) => console.error('Error receiving foreground message:', err));
    }
  }, [notificationPermission]);

  /**
   * Play notification sound
   */
  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch((error) => {
      console.error('Error playing notification sound:', error);
    });
  };

  return {
    fcmToken,
    notificationPermission,
    enableNotifications,
    isNotificationEnabled: notificationPermission === 'granted',
  };
};

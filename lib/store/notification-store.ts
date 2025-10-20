import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: number;
  type: 'new_order' | 'cancelled_order' | 'status_change' | 'info';
  title: string;
  message: string;
  booking_id?: number;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  lastChecked: string | null;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: Notification[]) => void;
  clearNotifications: () => void;
  updateLastChecked: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      lastChecked: null,

      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, is_read: true } : notif
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            is_read: true,
          })),
          unreadCount: 0,
        }));
      },

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter((n) => !n.is_read).length;
        set({
          notifications,
          unreadCount,
        });
      },

      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      updateLastChecked: () => {
        set({
          lastChecked: new Date().toISOString(),
        });
      },
    }),
    {
      name: 'notification-storage',
    }
  )
);

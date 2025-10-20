'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { enableNotifications, isNotificationEnabled } = useNotifications();

  useEffect(() => {
    // Check if notification permission has already been granted or denied
    if (typeof window === 'undefined') return;

    const checkPermission = () => {
      // Don't show if already enabled
      if (isNotificationEnabled) {
        return;
      }

      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('notification-prompt-dismissed');
      if (dismissed) {
        return;
      }

      // Check current permission status
      if ('Notification' in window) {
        const permission = Notification.permission;
        
        // Only show prompt if permission is 'default' (not asked yet)
        if (permission === 'default') {
          // Show prompt after 3 seconds of page load
          setTimeout(() => {
            setShowPrompt(true);
          }, 3000);
        }
      }
    };

    checkPermission();
  }, [isNotificationEnabled]);

  const handleEnable = async () => {
    try {
      await enableNotifications();
      setShowPrompt(false);
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    // Remember that user dismissed the prompt (for 7 days)
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Bildirimleri Etkinleştir
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Sipariş durumunuz ve özel kampanyalar hakkında anında bildirim alın.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Etkinleştir
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Daha Sonra
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'react-hot-toast';

export default function TestNotificationPage() {
  const [loading, setLoading] = useState(false);
  const { enableNotifications, isNotificationEnabled, fcmToken } = useNotifications();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [notificationSoundUrl, setNotificationSoundUrl] = useState<string | null>(null);
  
  // Fetch notification sound URL
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
          
          if (soundUrl) {
            audioRef.current = new Audio(soundUrl);
            audioRef.current.load();
            console.log('Test page audio initialized');
          }
        }
      } catch (error) {
        console.error('Error fetching notification sound:', error);
      }
    };
    
    fetchNotificationSound();
  }, []);
  
  // Debug: Log the state
  console.log('Notification state:', {
    isNotificationEnabled,
    fcmToken: fcmToken ? `${fcmToken.substring(0, 20)}...` : null,
    permission: typeof window !== 'undefined' ? Notification.permission : 'unknown'
  });

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const token = await enableNotifications();
      if (token) {
        toast.success('Bildirimler etkinleştirildi!');
      }
    } catch (error) {
      toast.error('Bildirimler etkinleştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSound = () => {
    if (audioRef.current) {
      console.log('🔊 Testing sound playback...');
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          console.log('✅ Sound test successful!');
          toast.success('Ses çalıyor! 🔊');
        })
        .catch((error) => {
          console.error('❌ Sound test failed:', error);
          toast.error('Ses çalınamadı: ' + error.message);
        });
    } else {
      console.log('⚠️ Audio not initialized');
      toast.error('Ses henüz yüklenmedi');
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/admin/notifications/test-notification/');
      
      if (response.success) {
        toast.success('Test bildirimi gönderildi! Birkaç saniye içinde görmelisiniz.');
      } else {
        toast.error(response.error?.message || 'Test bildirimi gönderilemedi');
      }
    } catch (error: any) {
      toast.error('Hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔔 FCM Bildirim Test Sayfası
          </h1>

          {/* Firebase Status */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Firebase Durumu
            </h2>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Bildirim İzni:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  isNotificationEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isNotificationEnabled ? '✅ Aktif' : '❌ Pasif'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">FCM Token:</span>
                <span className="text-sm text-gray-600 font-mono break-all">
                  {fcmToken ? `${fcmToken.substring(0, 30)}...` : 'Yok'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {!isNotificationEnabled && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-3">
                  ⚠️ Bildirimleri test etmek için önce izin vermelisiniz.
                </p>
                <button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Etkinleştiriliyor...' : '🔔 Bildirimleri Etkinleştir'}
                </button>
              </div>
            )}

            {isNotificationEnabled && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Bildirimler aktif! Artık push bildirim alabilirsiniz.
                  </p>
                </div>

                <button
                  onClick={handleTestNotification}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Gönderiliyor...' : '🚀 Test Bildirimi Gönder'}
                </button>

                <button
                  onClick={handleTestSound}
                  disabled={!notificationSoundUrl}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  🔊 Bildirim Sesini Test Et
                </button>
                
                {notificationSoundUrl && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-mono break-all">
                      Ses URL: {notificationSoundUrl}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">📋 Test Adımları:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Yukarıdaki "Bildirimleri Etkinleştir" butonuna tıklayın</li>
              <li>Tarayıcı izin isteğinde "İzin Ver" seçeneğini seçin</li>
              <li>FCM Token'ın oluşturulduğunu kontrol edin</li>
              <li>"Test Bildirimi Gönder" butonuna tıklayın</li>
              <li>Birkaç saniye içinde bildirim almalısınız</li>
            </ol>
          </div>

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🔍 Kontrol Listesi:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Firebase config .env.local dosyasında mı?</li>
              <li>✓ VAPID key eklenmiş mi?</li>
              <li>✓ Service worker çalışıyor mu?</li>
              <li>✓ Backend'de Firebase Admin SDK kurulu mu?</li>
              <li>✓ FCM credentials .env dosyasında mı?</li>
            </ul>
          </div>

          {/* Console Check */}
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>İpucu:</strong> Browser console'u açın (F12) ve aşağıdaki logları kontrol edin:
            </p>
            <ul className="mt-2 text-xs text-blue-800 font-mono space-y-1">
              <li>- "FCM Token: ..."</li>
              <li>- "FCM token saved to backend"</li>
              <li>- "Message received in foreground: ..."</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

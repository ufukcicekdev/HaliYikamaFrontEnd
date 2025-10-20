'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FirebaseServiceWorkerRegistration() {
  const router = useRouter();
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ [Service Worker] Registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.error('❌ [Service Worker] Registration failed:', error);
        });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 [App] Message from service worker:', event.data);
        
        if (event.data.type === 'NAVIGATE' && event.data.url) {
          console.log('🧭 [App] Navigating to:', event.data.url);
          router.push(event.data.url);
        }
      });
    } else {
      console.log('⚠️ [Service Worker] Not supported in this browser');
    }
  }, [router]);

  return null; // This component doesn't render anything
}

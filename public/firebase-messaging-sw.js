// Firebase Cloud Messaging Service Worker
// This file is loaded from the public folder and runs in the browser

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config will be set from the main app via postMessage
let firebaseConfig = null;

// Listen for config from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    if (firebaseConfig && !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized in service worker');
    }
  }
});

// Get messaging instance
const getMessagingInstance = () => {
  if (!firebase.apps.length && firebaseConfig) {
    firebase.initializeApp(firebaseConfig);
  }
  return firebase.messaging();
};

// Handle background messages
self.addEventListener('push', (event) => {
  console.log('📨 Push event received');
  
  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  try {
    const payload = event.data.json();
    console.log('Push payload:', payload);
    
    const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
    const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new notification';
    
    const notificationOptions = {
      body: notificationBody,
      icon: '/notification-icon.png',
      badge: '/badge-icon.png',
      tag: payload.data?.bookingId || 'default',
      data: payload.data || {},
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'view', title: 'Görüntüle' },
        { action: 'close', title: 'Kapat' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (error) {
    console.error('Error handling push:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/admin/dashboard';
  const fullUrl = self.location.origin + urlToOpen;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus().then(() => {
              client.postMessage({
                type: 'NAVIGATE',
                url: urlToOpen
              });
            });
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(clients.claim());
});

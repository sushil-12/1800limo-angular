// Firebase Messaging Service Worker
// This file must be in the root of your project (same level as index.html)

// Import Firebase scripts for v10
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7y0Ur3H7-T4kVh6yLQBloX7QrCq1jtCU",
  authDomain: "limo-2f17f.firebaseapp.com",
  projectId: "limo-2f17f",
  storageBucket: "limo-2f17f.firebasestorage.app",
  messagingSenderId: "1088057204155",
  appId: "1:1088057204155:web:0d7c19485b808e6817389e",
  measurementId: "G-Z7KS7TMZCH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/assets/images/logo.png',
    badge: '/assets/images/badge.png',
    tag: payload.data?.tag || 'default',
    data: payload.data || {},
    requireInteraction: payload.data?.requireInteraction === 'true',
    silent: payload.data?.silent === 'true',
    actions: []
  };

  // Add actions if provided
  if (payload.data?.actions) {
    try {
      notificationOptions.actions = JSON.parse(payload.data.actions);
    } catch (error) {
      console.error('Error parsing notification actions:', error);
    }
  }

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Handle notification actions
  if (event.action) {
    console.log('Notification action clicked:', event.action);
    
    // Handle different actions
    switch (event.action) {
      case 'view':
        // Open the app or specific page
        event.waitUntil(
          clients.openWindow('/')
        );
        break;
      case 'dismiss':
        // Just close the notification
        break;
      default:
        // Default action - open the app
        event.waitUntil(
          clients.openWindow('/')
        );
    }
  } else {
    // No specific action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Handle push event (fallback for older browsers)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('Push payload:', payload);

      const notificationTitle = payload.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/assets/images/logo.png',
        badge: '/assets/images/badge.png',
        tag: payload.data?.tag || 'default',
        data: payload.data || {},
        requireInteraction: payload.data?.requireInteraction === 'true',
        silent: payload.data?.silent === 'true'
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (error) {
      console.error('Error parsing push data:', error);
      
      // Fallback notification
      const notificationTitle = 'New Notification';
      const notificationOptions = {
        body: 'You have a new notification',
        icon: '/assets/images/logo.png',
        badge: '/assets/images/badge.png'
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    }
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle client messages
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 
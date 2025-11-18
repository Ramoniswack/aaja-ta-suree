// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyBJxDvervkpxbYD5lkHZxZwKrmgs5Fz9h4",
  authDomain: "aaja-ta-sure.firebaseapp.com",
  projectId: "aaja-ta-sure",
  storageBucket: "aaja-ta-sure.firebasestorage.app",
  messagingSenderId: "361552703650",
  appId: "1:361552703650:web:ea9cf9b1f44250e148e7fb"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/ats.png',
    badge: '/ats.png',
    tag: 'todo-notification',
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAvgxlVduWjGVWKPcsAN-2MZoEP6ObkSkI",
  authDomain: "loyalty-system-58a68.firebaseapp.com",
  projectId: "loyalty-system-58a68",
  storageBucket: "loyalty-system-58a68.firebasestorage.app",
  messagingSenderId: "854863955762",
  appId: "1:854863955762:web:bfd643ae8c9e98fd55f92b"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'إشعار جديد';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك رسالة جديدة',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

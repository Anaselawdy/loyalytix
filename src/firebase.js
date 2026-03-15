import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAvgxlVduWjGVWKPcsAN-2MZoEP6ObkSkI",
  authDomain: "loyalty-system-58a68.firebaseapp.com",
  projectId: "loyalty-system-58a68",
  storageBucket: "loyalty-system-58a68.firebasestorage.app",
  messagingSenderId: "854863955762",
  appId: "1:854863955762:web:bfd643ae8c9e98fd55f92b"
};

const app = initializeApp(firebaseConfig);

// Safely initialize messaging — not available in all environments (e.g. iOS Safari, some mobiles)
let messaging = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (e) {
  console.warn('Firebase messaging not supported in this environment:', e.message);
}

/**
 * Returns true if push notifications are supported on this device/browser.
 * Checks: Notification API, serviceWorker, PushManager, and Firebase messaging.
 */
export function isNotificationsSupported() {
  return (
    typeof Notification !== 'undefined' &&
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    messaging !== null
  );
}

const VAPID_KEY = "YOUR_VAPID_KEY";

// Request notification permission and get token
export async function requestNotificationPermission() {
  if (!isNotificationsSupported()) {
    console.warn('Push notifications not supported on this device/browser.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback) {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
}

export { messaging };

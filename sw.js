importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCWQKgdV0j8VV_dF1c7b7kPpTMlUwSBRoo",
  authDomain: "ukoly-zahrada.firebaseapp.com",
  projectId: "ukoly-zahrada",
  storageBucket: "ukoly-zahrada.firebasestorage.app",
  messagingSenderId: "101044245869",
  appId: "1:101044245869:web:ec22c6c1648520b09bf664"
});

const messaging = firebase.messaging();

// Zpracuje push notifikaci na pozadí (appka zavřená)
messaging.onBackgroundMessage(payload => {
  console.log('Background FCM message:', payload);
  const title = payload.notification?.title || 'Domácí úkoly';
  const body = payload.notification?.body || '';
  self.registration.showNotification(title, {
    body,
    tag: 'ukoly-fcm',
    renotify: true,
    icon: './icon-192.png'
  });
});

// Cache pro offline
const CACHE = 'domaci-ukoly-v2';
const ASSETS = ['./domaci-ukoly.html', './manifest.json', './icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => r))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window'}).then(list => {
      for (const c of list) {
        if (c.url.includes('domaci-ukoly') && 'focus' in c) return c.focus();
      }
      return clients.openWindow('./domaci-ukoly.html');
    })
  );
});

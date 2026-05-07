const CACHE_NAME = 'verified-match-v1';
const ASSETS = [
  '/verified-match/',
  '/verified-match/index.html',
  '/verified-match/manifest.json',
  '/verified-match/pages/login.html',
  '/verified-match/pages/register.html',
  '/verified-match/pages/dashboard.html',
  '/verified-match/pages/browse.html',
  '/verified-match/pages/messages.html',
  '/verified-match/pages/matches.html',
  '/verified-match/pages/notifications.html',
  '/verified-match/pages/profile.html',
  '/verified-match/pages/settings.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => caches.match('/verified-match/pages/dashboard.html'));
    })
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  self.registration.showNotification(data.title || 'Verified Match', {
    body: data.body || 'You have a new notification!',
    icon: '/verified-match/manifest.json',
    badge: '/verified-match/manifest.json',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/verified-match/pages/dashboard.html' }
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});

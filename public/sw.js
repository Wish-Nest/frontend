/* Service Worker (basic caching + push) */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Simple network-first for navigation and static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Web Push handler
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}
  const title = data.title || 'Nouvelle notification';
  const options = {
    body: data.body || '',
    icon: data.icon || '/logo.webp',
    badge: data.badge || '/logo.webp',
    data: data.data || {},
    actions: data.actions || []
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      let client = allClients.find(c => 'focus' in c);
      if (client) {
        client.focus();
        if ('navigate' in client) client.navigate(url);
        return;
      }
      if (clients.openWindow) await clients.openWindow(url);
    })()
  );
});

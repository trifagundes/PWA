const CACHE_NAME = 'agnostic-pwa-v1782260719151';
const ASSETS = [
  'index.html',
  'manifest.json',
  'css/reset.css',
  'css/style.css',
  'js/app.js',
  'js/router.js',
  'js/store.js',
  'js/version.js',
  'js/services/db.js',
  'js/views/home.js',
  'js/views/detail.js',
  'js/views/favorites.js',
  'js/views/profile.js',
  'js/components/card.js',
  'js/components/auth-modal.js',
  'js/components/notification-drawer.js',
  'images/icons/launchericon-192x192.png',
  'images/icons/launchericon-512x512.png',
  'images/icons/favicon.png',
  'data/categories.json',
  'data/itens.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

/* Suporte a Notificações Push */
self.addEventListener('push', (event) => {
  let data = { title: 'Notificação', body: 'Você recebeu um novo aviso.' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Notificação', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/FRONT/images/icons/launchericon-192x192.png',
    badge: '/FRONT/images/icons/launchericon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin + '/new/index.html'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const urlToOpen = event.notification.data.url;
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

const CACHE_NAME = 'sumi-rune-v1';
const urlsToCache = [
  '/',
  '/rune-divination.html',
  '/manifest.json',
  '/icon.svg'
];

// インストール時にキャッシュを準備
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// キャッシュから取得、なければネットワークから取得
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // ネットワークからの取得成功時はキャッシュに追加
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
          return response;
        });
      })
      .catch(() => {
        // オフライン時はキャッシュから取得
        return caches.match('/rune-divination.html');
      })
  );
});

const CACHE = 'habitos-beta1-v12';

const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './nico.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // HTML: siempre intentar obtener la versión más reciente.
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('/index.html')
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put('./index.html', copy))
            .catch(() => {});

          return response;
        })
        .catch(() => caches.match('./index.html'))
    );

    return;
  }

  // Archivos restantes: caché primero y red como alternativa.
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            const copy = response.clone();

            caches.open(CACHE)
              .then(cache => cache.put(event.request, copy))
              .catch(() => {});

            return response;
          })
          .catch(() => caches.match('./index.html'));
      })
  );
});

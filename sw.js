const CACHE = 'habitos-beta1-v29';
const CORE = ['./','./index.html','./manifest.webmanifest','./icon.svg','./nico.png','./assets/nico.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('habitos-beta1-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(fetch(request, {cache:'no-store'}).then(response => {
      if (response && response.ok) caches.open(CACHE).then(cache => cache.put('./index.html', response.clone())).catch(()=>{});
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response && response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone())).catch(()=>{});
    return response;
  }).catch(() => caches.match('./index.html'))));
});

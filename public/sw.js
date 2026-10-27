// Offline support: the app shell and every lab chunk the child has opened keep working
// without a connection (useful on patchy mobile data). Bump VERSION to drop old caches.
const VERSION = 'omnilearn-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
const CDN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const putInCache = async (request, response) => {
  if (response && (response.ok || response.type === 'opaque')) {
    const cache = await caches.open(VERSION);
    await cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Pages: try the network first so updates show up, fall back to the cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => putInCache('./index.html', res))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Hashed build assets never change, and fonts/KaTeX CSS rarely do: serve from cache first.
  if ((sameOrigin && url.pathname.includes('/assets/')) || CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((res) => putInCache(request, res))));
    return;
  }

  if (sameOrigin) {
    event.respondWith(
      caches.match(request).then((hit) => {
        const fresh = fetch(request)
          .then((res) => putInCache(request, res))
          .catch(() => hit);
        return hit || fresh;
      })
    );
  }
});

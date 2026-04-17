/**
 * DeePay Service Worker — v3
 *
 * Strategy:
 *  - Static app-shell assets (JS, CSS, fonts, images): Cache-first with cache update in background.
 *  - Navigation requests (HTML documents): Network-first, NO caching — prevents the stale-shell bug
 *    where the browser serves an old cached HTML that references non-existent JS bundles.
 *  - API / Laravel backend requests: Network-only — always fresh data.
 *
 * Bump CACHE_VERSION to force all clients to re-download assets on next visit.
 */

const CACHE_VERSION = 'deepay-v3';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;

/** Assets that form the app-shell — cached eagerly on install */
const PRECACHE_URLS = [
  '/assets/global/css/bootstrap.min.css',
  '/assets/global/css/all.min.css',
  '/assets/global/css/line-awesome.min.css',
  '/assets/global/js/jquery-3.7.1.min.js',
  '/assets/global/js/bootstrap.bundle.min.js',
  '/assets/global/js/global.js',
];

/** Request types that should NEVER be cached */
function isUncacheable(request) {
  const url = new URL(request.url);
  // Never cache HTML (navigation) — avoids the startup-shell stale-HTML bug
  if (request.mode === 'navigate') return true;
  // Never cache API / backend routes
  if (url.pathname.startsWith('/api/')) return true;
  // Never cache authentication routes
  if (url.pathname.match(/\/(user|admin)\//)) return true;
  return false;
}

/** True for static asset URLs (JS, CSS, images, fonts) */
function isStaticAsset(request) {
  return /\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg|ico|webp)(\?.*)?$/.test(
    new URL(request.url).pathname,
  );
}

/* ── Install: pre-cache app-shell assets ───────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

/* ── Activate: delete stale caches from previous versions ───── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* ── Fetch: routing strategy ─────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Non-cacheable: pass straight through to network
  if (isUncacheable(event.request)) {
    return; // browser handles it — no respondWith()
  }

  if (isStaticAsset(event.request)) {
    // Cache-first: serve from cache, update in background (stale-while-revalidate)
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200 && response.type !== 'opaque') {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => null);

        return cached || networkFetch;
      }),
    );
    return;
  }

  // Everything else: network-first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          caches
            .open(SHELL_CACHE)
            .then((cache) => cache.put(event.request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});

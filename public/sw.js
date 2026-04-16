// StadiumSense Service Worker
// Handles: app shell caching, offline venue map, background sync for orders

const CACHE_VERSION = 'v1'
const SHELL_CACHE = `stadiumsense-shell-${CACHE_VERSION}`
const MAP_CACHE = `stadiumsense-maps-${CACHE_VERSION}`
const DYNAMIC_CACHE = `stadiumsense-dynamic-${CACHE_VERSION}`

// ─── Workbox Precache Manifest (injected by vite-plugin-pwa at build time) ────
// This placeholder is required for the injectManifest strategy.
const WB_MANIFEST = self.__WB_MANIFEST || []

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]


const MAPS_TILE_PATTERNS = [
  'maps.googleapis.com',
  'maps.gstatic.com',
]

// ─── Install: pre-cache app shell ─────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ─── Activate: clean old caches ───────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== MAP_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// ─── Fetch: cache strategies ──────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return

  // Maps tile assets: cache-first for offline venue map
  if (MAPS_TILE_PATTERNS.some((p) => url.hostname.includes(p))) {
    event.respondWith(
      caches.open(MAP_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        try {
          const response = await fetch(request)
          if (response.ok) cache.put(request, response.clone())
          return response
        } catch {
          return cached ?? new Response('Map tile unavailable offline', { status: 503 })
        }
      })
    )
    return
  }

  // App shell: cache-first
  if (SHELL_ASSETS.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request))
    )
    return
  }

  // JS/CSS assets: stale-while-revalidate
  if (url.pathname.match(/\.(js|css|woff2?|png|svg|webp)$/)) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        }).catch(() => cached)
        return cached ?? networkFetch
      })
    )
    return
  }

  // Navigation requests: serve app shell for SPA routing
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html')
      )
    )
    return
  }

  // Everything else: network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

// ─── Push Notifications (FCM) ─────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = { title: 'StadiumSense', body: 'You have a new update.', icon: '/icons/icon-192.png' }
  try {
    data = { ...data, ...event.data?.json() }
  } catch { /* use defaults */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'stadiumsense-alert',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existing = windowClients.find((c) => c.url === targetUrl && 'focus' in c)
      if (existing) return existing.focus()
      return clients.openWindow(targetUrl)
    })
  )
})

// ─── Background Sync: offline orders ──────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders())
  }
})

async function syncPendingOrders() {
  // In a full implementation this would read from IndexedDB
  // and POST pending orders to Firestore REST API
  console.log('[SW] Background sync: syncing pending orders')
}

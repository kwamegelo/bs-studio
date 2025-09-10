const CACHE_NAME = 'bs-studio-v1.1.0';
const OFFLINE_URL = '/offline.html';

// Essential files to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/booking.html',
  '/business-hours.html',
  '/timer.html',
  '/styles/style.css',
  '/script.js',
  '/manifest.json',
  OFFLINE_URL,
  // Images - only cache essential ones initially
  '/images/BS_logo.png',
  '/images/BS_logo_transparent.png',
  '/images/BS_logo.png',
  '/images/BS_logo_512.png'
];

// Network-first resources (always try to get fresh content)
const NETWORK_FIRST_URLS = [
  '/api/',
  '/booking',
  '/contact'
];

// Cache-first resources (images, fonts, etc.)
const CACHE_FIRST_URLS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif', 
  '.webp',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        
        // Cache essential files one by one to avoid failure on single file issues
        return Promise.allSettled(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`[Service Worker] Failed to cache ${url}:`, error);
              return Promise.resolve(); // Don't fail the entire installation
            });
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] App shell cached successfully');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!requestUrl.protocol.startsWith('http')) {
    return;
  }
  
  // Handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }
  
  // Handle different types of requests based on URL patterns
  if (shouldUseNetworkFirst(event.request.url)) {
    event.respondWith(handleNetworkFirst(event.request));
  } else if (shouldUseCacheFirst(event.request.url)) {
    event.respondWith(handleCacheFirst(event.request));
  } else {
    event.respondWith(handleStaleWhileRevalidate(event.request));
  }
});

// Handle navigation requests (pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed for navigation, trying cache');
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page as fallback
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Final fallback - basic offline message
    return new Response(
      `<!DOCTYPE html>       
<html lang="en">       
<head>           
    <meta charset="UTF-8">           
    <meta name="viewport" content="width=device-width, initial-scale=1.0">           
    <title>Offline - BS Studio</title>           
    <style>               
        body { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: #f8f2f4; color: #2d2d2d; }               
        .logo { color: #7a1c5e; font-size: 2em; margin-bottom: 20px; }               
        .message { font-size: 1.2em; margin-bottom: 30px; }               
        .retry-btn { background: #7a1c5e; color: #ffffff; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; }               
        .retry-btn:hover { background: #e1306c; }           
    </style>       
</head>       
<body>           
    <div class="logo">BS Studio</div>           
    <h1>You're Offline</h1>           
    <p class="message">Please check your internet connection and try again.</p>           
    <button class="retry-btn" onclick="window.location.reload()">Retry</button>       
</body>       
</html>`,
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
}

// Network-first strategy (for dynamic content)
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network first failed, trying cache');
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Network error occurred', { status: 408 });
  }
}

// Cache-first strategy (for static assets)
async function handleCacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Cache first failed for:', request.url);
    
    // Return placeholder for images
    if (request.destination === 'image') {
      return new Response(
        `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="200" fill="#f8f2f4"/>
          <text x="150" y="100" text-anchor="middle" fill="#7a1c5e" font-family="Arial">
            <tspan x="150" y="90">Image</tspan>
            <tspan x="150" y="110">Unavailable</tspan>
          </text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    return new Response('Resource not available offline', { status: 408 });
  }
}

// Stale-while-revalidate strategy (for most content)
async function handleStaleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Always try to fetch fresh content in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cache
    return cachedResponse;
  });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Helper functions to determine caching strategy
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

function shouldUseCacheFirst(url) {
  return CACHE_FIRST_URLS.some(extension => url.includes(extension));
}

// Background sync (when online again)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Add any background sync logic here
  // For example: sync offline bookings, update cache, etc.
  try {
    console.log('[Service Worker] Performing background sync');
    // Update critical resources
    const cache = await caches.open(CACHE_NAME);
    await cache.add('/');
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from BS Studio!',
    icon: '/images/BS_logo.png',
    badge: '/images/BS_logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'bs-studio-notification'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/images/BS_logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/BS_logo.png'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification('BS Studio', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if app not already open
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Message handling (communication with main app)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
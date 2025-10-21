// Service Worker for Didi's Digital Twin PWA - Enhanced for Offline Support
const CACHE_NAME = 'didi-digital-twin-v2';
const API_CACHE = 'didi-api-cache-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('✅ Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('⚠️ Some resources failed to cache:', err);
        });
      }),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// Fetch event - Network-first strategy for API, Cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first strategy for API calls
  if (url.origin.includes('localhost:5002') || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response and cache it
          const responseClone = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('📴 Serving from cache (offline):', request.url);
              return cachedResponse;
            }
            // Return offline response
            return new Response(
              JSON.stringify({ 
                offline: true, 
                error: 'You are offline. Data will sync when you reconnect.' 
              }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
  } 
  // Cache-first strategy for static assets
  else {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Cache the new resource
          if (request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim() // Take control of all pages immediately
    ]).then(() => {
      console.log('✅ Service Worker activated and ready!');
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Background sync function
async function syncTransactions() {
  console.log('🔄 Starting background sync...');
  
  try {
    // Open IndexedDB
    const db = await openDatabase();
    const transactions = await getUnsyncedTransactions(db);
    
    if (transactions.length === 0) {
      console.log('✅ No transactions to sync');
      return;
    }

    console.log(`🔄 Syncing ${transactions.length} transactions...`);

    // Send to backend
    const response = await fetch('http://localhost:5002/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactions: transactions,
        userId: 'demo-user-123'
      })
    });

    if (response.ok) {
      console.log('✅ Background sync successful!');
      await markTransactionsAsSynced(db, transactions);
      
      // Notify user
      self.registration.showNotification('Didi\'s Digital Twin', {
        body: `✅ ${transactions.length} transactions synced successfully!`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });
    } else {
      console.error('❌ Background sync failed');
    }
  } catch (error) {
    console.error('❌ Sync error:', error);
  }
}

// Helper functions for IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DidiDigitalTwinDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getUnsyncedTransactions(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['offlineTransactions'], 'readonly');
    const store = tx.objectStore('offlineTransactions');
    const index = store.index('synced');
    const request = index.getAll(false);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function markTransactionsAsSynced(db, transactions) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['offlineTransactions'], 'readwrite');
    const store = tx.objectStore('offlineTransactions');
    
    transactions.forEach(t => {
      t.synced = true;
      store.put(t);
    });
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Message handling for manual sync requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_NOW') {
    console.log('📨 Manual sync requested');
    syncTransactions();
  }
});


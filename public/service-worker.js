/**
 * service-worker.js
 * 
 * Vylepšený Service Worker pro aplikaci Průzkumník Vysokého Mýta
 * - Cachování souborů pro offline použití
 * - Strategie cache-first pro statické soubory, network-first pro API
 * - Pokročilá správa cache map
 * - Předběžné načítání (prefetch) důležitých zdrojů
 */

// Verze cache - zvyšte při významných změnách v aplikaci
const CACHE_VERSION = 'vysokemyto-v1.2';

// Názvy cache úložišť
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const MAP_CACHE = `${CACHE_VERSION}-maps`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Maximální počet položek v dynamické cache
const MAX_DYNAMIC_CACHE_ITEMS = 100;

// Seznam souborů, které se mají cachovat při instalaci
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/favicon.ico',
  '/offline.html',  // Záložní HTML pro offline režim
  // Základní obrázky
  '/assets/avatars/default.png',
  '/assets/sounds/notification.mp3',
  // Fonty
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Quattrocento:wght@400;700&display=swap',
  // Přidejte další důležité soubory podle potřeby
];

// Instalace Service Workeru
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalace');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Předběžné načítání statických souborů');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Aktivace Service Workeru - vyčištění starých verzí cache
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Aktivace');
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          // Odstranění všech starších verzí cache
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== MAP_CACHE && key !== API_CACHE) {
            console.log('[Service Worker] Odstraňuji starou cache:', key);
            return caches.delete(key);
          }
          return Promise.resolve();
        }));
      })
      .then(() => self.clients.claim()) // Převzetí kontroly nad všemi stránkami
  );
});

// Zpracování požadavků - různé strategie podle typu požadavku
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Zpracování mapových dlaždic - strategie cache-first s dynamickým ukládáním
  if (url.pathname.includes('/tile/') || 
      url.href.includes('tiles.mapbox.com') ||
      url.href.includes('tile.openstreetmap.org')) {
    event.respondWith(handleMapTileRequest(event.request));
    return;
  }
  
  // Požadavky na API - strategie network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Statické soubory - strategie cache-first
  if (STATIC_FILES.includes(url.pathname) || 
      url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    event.respondWith(handleStaticFileRequest(event.request));
    return;
  }
  
  // Ostatní navigační požadavky - strategie network-first s fallback na offline stránku
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }
  
  // Výchozí strategie - network-first s dynamickým cachováním
  event.respondWith(handleDefaultRequest(event.request));
});

/**
 * Zpracování požadavku na mapovou dlaždici
 */
async function handleMapTileRequest(request) {
  // Nejprve zkusíme z cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Pokud není v cache, stáhneme z internetu
    const networkResponse = await fetch(request);
    
    // Uložíme do cache, pokud je požadavek úspěšný
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(MAP_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    
    return networkResponse;
  } catch (err) {
    console.error('[Service Worker] Chyba při načítání mapových dlaždic:', err);
    // V případě selhání vrátíme fallback dlaždici nebo prázdnou odpověď
    return caches.match('/assets/map-fallback-tile.png');
  }
}

/**
 * Zpracování požadavku na API
 */
async function handleApiRequest(request) {
  try {
    // Nejprve zkusíme z internetu
    const networkResponse = await fetch(request);
    
    // Uložíme do cache, pokud je požadavek úspěšný
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(API_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    
    return networkResponse;
  } catch (err) {
    // Při chybě sítě zkusíme cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Pokud ani to nefunguje, vrátíme chybovou odpověď
    console.error('[Service Worker] API požadavek selhal a není v cache:', err);
    return new Response(JSON.stringify({ error: 'Nelze se připojit k API.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Zpracování požadavku na statický soubor
 */
async function handleStaticFileRequest(request) {
  // Strategie cache-first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Pokud není v cache, stáhneme z internetu
    const networkResponse = await fetch(request);
    
    // Uložíme do cache, pokud je požadavek úspěšný
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(STATIC_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
      });
      
      return networkResponse;
    }
    
    throw new Error('Nepodařilo se načíst statický soubor.');
  } catch (err) {
    console.error('[Service Worker] Chyba při načítání statického souboru:', err);
    // Nemáme žádnou fallback možnost pro statické soubory
    throw err;
  }
}

/**
 * Zpracování navigačního požadavku (např. přechod na jinou stránku)
 */
async function handleNavigationRequest(request) {
  try {
    // Nejprve zkusíme z internetu
    const networkResponse = await fetch(request);
    
    // Uložíme do cache, pokud je požadavek úspěšný
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
        // Limitujeme velikost dynamické cache
        trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ITEMS);
      });
    }
    
    return networkResponse;
  } catch (err) {
    // Při chybě sítě zkusíme cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Pokud ani to nefunguje, vrátíme offline stránku
    console.error('[Service Worker] Navigační požadavek selhal:', err);
    return caches.match('/offline.html');
  }
}

/**
 * Výchozí zpracování požadavku
 */
async function handleDefaultRequest(request) {
  try {
    // Nejprve zkusíme z internetu
    const networkResponse = await fetch(request);
    
    // Uložíme do cache, pokud je požadavek úspěšný
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
        // Limitujeme velikost dynamické cache
        trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ITEMS);
      });
    }
    
    return networkResponse;
  } catch (err) {
    // Při chybě sítě zkusíme cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Není žádná fallback možnost pro ostatní požadavky
    console.error('[Service Worker] Požadavek selhal a není v cache:', err);
    throw err;
  }
}

/**
 * Omezení velikosti cache odstraněním nejstarších položek
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Odstraníme přebytečné položky od nejstarších
    const itemsToDelete = keys.length - maxItems;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
    console.log(`[Service Worker] Odstraněno ${itemsToDelete} položek z cache ${cacheName}`);
  }
}

/**
 * Odeslání zprávy všem aktivním klientům
 */
function notifyClients(message) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
}

/**
 * Zpracování synchronizačních událostí (background sync)
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event:', event.tag);

  // Synchronizace mapy - odložené stažení mapových dlaždic
  if (event.tag === 'sync-map-data') {
    event.waitUntil(syncMapData());
  }
});

/**
 * Synchronizace mapových dat na pozadí
 */
async function syncMapData() {
  // Implementace synchronizace mapy
  try {
    // Sem přijde kód pro synchronizaci mapových dat
    notifyClients({
      type: 'SYNC_COMPLETED',
      feature: 'map-data',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Service Worker] Chyba synchronizace mapy:', error);
    notifyClients({
      type: 'SYNC_FAILED',
      feature: 'map-data',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}

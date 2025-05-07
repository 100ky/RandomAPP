import { Map, Marker, Popup, LngLatBounds } from 'maplibre-gl';
import maplibre from 'maplibre-gl';

export interface Location {
    name: string;
    description: string;
    longitude: number;
    latitude: number;
}

export const addMarkerToMap = (map: Map, location: Location) => {
    const marker = new Marker()
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new Popup().setHTML(`<h3>${location.name}</h3><p>${location.description}</p>`))
        .addTo(map);
    
    return marker;
};

export const fitMapToMarkers = (map: Map, markers: Location[]) => {
    const bounds = new LngLatBounds();
    
    markers.forEach(marker => {
        bounds.extend([marker.longitude, marker.latitude]);
    });
    
    map.fitBounds(bounds, { padding: 20 });
};

// Funkce pro vytvoření a inicializaci databáze pro mapové dlaždice
const initializeOfflineDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject('IndexedDB není v tomto prohlížeči podporována');
            return;
        }

        const request = indexedDB.open('map-tiles-cache', 1);

        request.onerror = (event) => {
            reject('Nepodařilo se otevřít databázi pro offline mapy');
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('tiles')) {
                const store = db.createObjectStore('tiles', { keyPath: 'id' });
                store.createIndex('url', 'url', { unique: true });
            }
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };
    });
};

// Funkce pro uložení mapové dlaždice do cache
const saveTileToCache = async (url: string, blob: Blob): Promise<void> => {
    try {
        const db = await initializeOfflineDB();
        const transaction = db.transaction(['tiles'], 'readwrite');
        const store = transaction.objectStore('tiles');
        const id = url.split('/').slice(-3).join('-'); // Vytvoříme ID ze z/x/y

        await new Promise<void>((resolve, reject) => {
            const request = store.put({
                id,
                url,
                blob,
                timestamp: Date.now(),
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Nepodařilo se uložit dlaždici do cache'));
        });

        db.close();
    } catch (error) {
        console.error('Chyba při ukládání dlaždice:', error);
        throw error;
    }
};

// Funkce pro načtení mapové dlaždice z cache
export const getTileFromCache = async (url: string): Promise<Blob | null> => {
    try {
        const db = await initializeOfflineDB();
        const transaction = db.transaction(['tiles'], 'readonly');
        const store = transaction.objectStore('tiles');
        const index = store.index('url');

        return new Promise((resolve, reject) => {
            const request = index.get(url);

            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    resolve(result.blob);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                reject(new Error('Nepodařilo se načíst dlaždici z cache'));
            };
        });
    } catch (error) {
        console.error('Chyba při načítání dlaždice:', error);
        return null;
    }
};

// Funkce pro stažení a uložení mapových dlaždic do offline cache
export const createOfflineMapCache = async (
    bounds: maplibre.LngLatBounds,
    minZoom: number,
    maxZoom: number,
    progressCallback: (progress: number) => void
): Promise<void> => {
    // Vypočítáme počet dlaždic pro každý zoom level v daných hranicích
    let totalTiles = 0;
    let downloadedTiles = 0;
    
    // Nejprve spočítáme celkový počet dlaždic
    for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
        const nw = bounds.getNorthWest();
        const se = bounds.getSouthEast();

        // Převést souřadnice na indexy dlaždic
        const nwPoint = getTileXY(nw.lng, nw.lat, zoom);
        const sePoint = getTileXY(se.lng, se.lat, zoom);

        const xMin = Math.floor(Math.min(nwPoint.x, sePoint.x));
        const xMax = Math.ceil(Math.max(nwPoint.x, sePoint.x));
        const yMin = Math.floor(Math.min(nwPoint.y, sePoint.y));
        const yMax = Math.ceil(Math.max(nwPoint.y, sePoint.y));

        // Počet dlaždic pro tento zoom level
        const tilesForZoom = (xMax - xMin + 1) * (yMax - yMin + 1);
        totalTiles += tilesForZoom;
    }

    // Pro každý zoom level stáhneme a uložíme dlaždice
    for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
        const nw = bounds.getNorthWest();
        const se = bounds.getSouthEast();

        // Převést souřadnice na indexy dlaždic
        const nwPoint = getTileXY(nw.lng, nw.lat, zoom);
        const sePoint = getTileXY(se.lng, se.lat, zoom);

        const xMin = Math.floor(Math.min(nwPoint.x, sePoint.x));
        const xMax = Math.ceil(Math.max(nwPoint.x, sePoint.x));
        const yMin = Math.floor(Math.min(nwPoint.y, sePoint.y));
        const yMax = Math.ceil(Math.max(nwPoint.y, sePoint.y));

        // Pro každou dlaždici
        for (let x = xMin; x <= xMax; x++) {
            for (let y = yMin; y <= yMax; y++) {
                try {
                    // Adresy dlaždic pro tři OpenStreetMap servery
                    const urls = [
                        `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
                        `https://b.tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
                        `https://c.tile.openstreetmap.org/${zoom}/${x}/${y}.png`
                    ];

                    // Použijeme pouze jeden z těchto URL (první)
                    const url = urls[0];
                    
                    // Stáhneme dlaždici
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Nepodařilo se stáhnout dlaždici: ${response.statusText}`);
                    }
                    
                    const blob = await response.blob();
                    
                    // Uložíme dlaždici do cache
                    await saveTileToCache(url, blob);
                    
                    // Aktualizujeme progress
                    downloadedTiles++;
                    const progress = (downloadedTiles / totalTiles) * 100;
                    progressCallback(progress);

                    // Přidáme malou prodlevu, abychom nepřetížili server
                    await new Promise(resolve => setTimeout(resolve, 20));
                } catch (error) {
                    console.error(`Chyba při stahování dlaždice ${zoom}/${x}/${y}:`, error);
                    // Pokračujeme s dalšími dlaždicemi i v případě chyby
                }
            }
        }
    }
};

// Pomocná funkce pro převod zeměpisných souřadnic na indexy dlaždic
const getTileXY = (lng: number, lat: number, zoom: number) => {
    const n = Math.pow(2, zoom);
    const x = (lng + 180) / 360 * n;
    const latRad = (lat * Math.PI) / 180;
    const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
    
    return { x, y };
};
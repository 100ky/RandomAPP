/**
 * mapCacheManager.ts
 * Vylepšený správce pro ukládání a správu offline mapových dlaždic
 */

import { OfflineMapsStatus } from '../types/game';

// Název úložiště pro offline mapy
const TILE_STORAGE_NAME = 'vysokemyto-map-tiles-cache';
// Verze úložiště - zvyšte při změně struktury dat
const STORAGE_VERSION = '1.1';
// Maximální stáří dlaždice v cache (7 dní)
const MAX_TILE_AGE = 7 * 24 * 60 * 60 * 1000;
// Aktuální objem paměti zabraný dlaždicemi (v MB)
let currentStorageSize = 0;

/**
 * Metadata offline map pro uložení do localStorage
 */
interface OfflineMapMetadata {
  version: string;
  lastUpdated: number;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  zoomLevels: {
    min: number;
    max: number;
  };
  tileCount: number;
  estimatedSize: number; // v MB
  status: OfflineMapsStatus;
}

/**
 * Informace o mapové dlaždici v cache
 */
interface StoredTileInfo {
  url: string;
  data: ArrayBuffer;
  timestamp: number;
  size: number;
}

/**
 * Inicializace offline cache manažeru
 */
export async function initMapCache(): Promise<void> {
  try {
    // Vytvoření DB pokud neexistuje
    const db = await openDatabase();
    // Zjištění aktuální velikosti dat
    currentStorageSize = await calculateStorageSize();
    await db.close();
    console.log(`Offline mapa inicializována - aktuální velikost: ${currentStorageSize.toFixed(2)} MB`);
  } catch (error) {
    console.error('Chyba při inicializaci map cache:', error);
  }
}

/**
 * Otevře IndexedDB databázi pro uložení mapových dlaždic
 */
async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(TILE_STORAGE_NAME, 1);
    
    // Vytvoříme strukturu při první inicializaci
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Kontrola, zda úložiště již existuje
      if (!db.objectStoreNames.contains('tiles')) {
        // Vytvoření objektu pro ukládání dlaždic
        const tileStore = db.createObjectStore('tiles', { keyPath: 'url' });
        // Indexy pro rychlé vyhledávání a čištění
        tileStore.createIndex('timestamp', 'timestamp', { unique: false });
        tileStore.createIndex('size', 'size', { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Nelze otevřít offline úložiště map'));
  });
}

/**
 * Uloží dlaždici do cache
 * @param url URL dlaždice
 * @param data Data dlaždice
 */
export async function saveTile(url: string, data: ArrayBuffer): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['tiles'], 'readwrite');
    const store = transaction.objectStore('tiles');
    
    // Informace o dlaždici
    const tileInfo: StoredTileInfo = {
      url,
      data,
      timestamp: Date.now(),
      size: data.byteLength
    };
    
    // Přidání/aktualizace dlaždice
    store.put(tileInfo);
    
    // Aktualizace velikosti úložiště
    currentStorageSize += data.byteLength / (1024 * 1024);
    
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = reject;
    });
    
    await db.close();
    
  } catch (error) {
    console.error(`Chyba při ukládání dlaždice ${url}:`, error);
  }
}

/**
 * Načte dlaždici z cache
 * @param url URL dlaždice
 * @returns Data dlaždice nebo null, pokud nebyla nalezena
 */
export async function loadTile(url: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['tiles'], 'readonly');
    const store = transaction.objectStore('tiles');
    
    // Najdeme dlaždici podle URL
    const request = store.get(url);
    
    const result = await new Promise<StoredTileInfo | undefined>((resolve) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(undefined);
    });
    
    await db.close();
    
    // Vrátíme data, pokud existují a nejsou příliš stará
    if (result && (Date.now() - result.timestamp) < MAX_TILE_AGE) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Chyba při načítání dlaždice ${url}:`, error);
    return null;
  }
}

/**
 * Vyčistí staré dlaždice z cache
 */
export async function cleanupOldTiles(): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['tiles'], 'readwrite');
    const store = transaction.objectStore('tiles');
    const index = store.index('timestamp');
    
    // Limit stáří
    const timeLimit = Date.now() - MAX_TILE_AGE;
    
    // Najdeme všechny staré dlaždice
    const keyRange = IDBKeyRange.upperBound(timeLimit);
    const request = index.openCursor(keyRange);
    
    // Počet odstraněných dlaždic a uvolněná velikost
    let removedCount = 0;
    let freedSize = 0;
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      
      if (cursor) {
        // Odstranění dlaždice
        const tileInfo = cursor.value as StoredTileInfo;
        store.delete(cursor.primaryKey);
        
        // Aktualizace statistik
        removedCount++;
        freedSize += tileInfo.size;
        
        // Pokračování na další starou dlaždici
        cursor.continue();
      }
    };
    
    await new Promise((resolve) => {
      transaction.oncomplete = resolve;
    });
    
    await db.close();
    
    // Aktualizace velikosti úložiště
    currentStorageSize -= freedSize / (1024 * 1024);
    
    console.log(`Vyčištěno ${removedCount} starých dlaždic, uvolněno ${(freedSize / (1024 * 1024)).toFixed(2)} MB`);
  } catch (error) {
    console.error('Chyba při čištění starých dlaždic:', error);
  }
}

/**
 * Stáhne mapu pro offline použití v určité oblasti
 * @param boundingBox Oblast mapy k uložení
 * @param minZoom Minimální úroveň přiblížení
 * @param maxZoom Maximální úroveň přiblížení
 * @param tileUrlPattern Vzorec URL pro dlaždice (např. 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
 * @param progressCallback Callback pro sledování průběhu stahování
 */
export async function downloadOfflineArea(
  boundingBox: { minLat: number, maxLat: number, minLng: number, maxLng: number },
  minZoom: number,
  maxZoom: number,
  tileUrlPattern: string,
  progressCallback: (progress: number, total: number, current: number) => void
): Promise<void> {
  // Výpočet hranic dlaždic pro každou úroveň přiblížení
  const tiles: { x: number, y: number, z: number }[] = [];
  
  // Výpočet všech dlaždic k uložení
  for (let z = minZoom; z <= maxZoom; z++) {
    // Převod GPS souřadnic na indexy dlaždic
    const xMin = Math.floor((boundingBox.minLng + 180) / 360 * Math.pow(2, z));
    const xMax = Math.floor((boundingBox.maxLng + 180) / 360 * Math.pow(2, z));
    
    const yMin = Math.floor((1 - Math.log(Math.tan(boundingBox.maxLat * Math.PI / 180) + 1 / Math.cos(boundingBox.maxLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
    const yMax = Math.floor((1 - Math.log(Math.tan(boundingBox.minLat * Math.PI / 180) + 1 / Math.cos(boundingBox.minLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
    
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        tiles.push({ x, y, z });
      }
    }
  }
  
  // Uložení metadat o oblasti
  saveOfflineMapMetadata({
    version: STORAGE_VERSION,
    lastUpdated: Date.now(),
    boundingBox,
    zoomLevels: {
      min: minZoom,
      max: maxZoom
    },
    tileCount: tiles.length,
    estimatedSize: tiles.length * 0.01, // Přibližně 10KB na dlaždici
    status: 'downloading'
  });
  
  // Stahování všech dlaždic
  let completed = 0;
  const totalTiles = tiles.length;
  
  // Stahujeme po skupinách pro ušetření výkonu
  const batchSize = 5;
  
  for (let i = 0; i < totalTiles; i += batchSize) {
    const batch = tiles.slice(i, i + batchSize);
    await Promise.all(batch.map(async (tile) => {
      try {
        // Sestavení URL pro dlaždici
        const url = tileUrlPattern
          .replace('{z}', tile.z.toString())
          .replace('{x}', tile.x.toString())
          .replace('{y}', tile.y.toString())
          .replace('{s}', ['a', 'b', 'c'][Math.floor(Math.random() * 3)]);
        
        // Stažení dlaždice
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.arrayBuffer();
          await saveTile(url, data);
        }
      } catch (error) {
        console.error('Chyba při stahování dlaždice:', error);
      }
      
      // Aktualizace průběhu
      completed++;
      progressCallback(Math.floor((completed / totalTiles) * 100), totalTiles, completed);
    }));
    
    // Krátké zpoždění mezi dávkami
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Aktualizace stavu stahování na dokončeno
  const metadata = getOfflineMapMetadata();
  if (metadata) {
    saveOfflineMapMetadata({
      ...metadata,
      lastUpdated: Date.now(),
      status: 'downloaded'
    });
  }
}

/**
 * Vypočítá aktuální velikost uložených dat v cache
 */
export async function calculateStorageSize(): Promise<number> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['tiles'], 'readonly');
    const store = transaction.objectStore('tiles');
    
    // Použití kurzoru k procházení všech dlaždic a sčítání velikostí
    const request = store.openCursor();
    let totalSize = 0;
    
    await new Promise((resolve) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          // Přičtení velikosti aktuální dlaždice
          const tileInfo = cursor.value as StoredTileInfo;
          totalSize += tileInfo.size;
          
          // Pokračování na další dlaždici
          cursor.continue();
        } else {
          resolve(undefined);
        }
      };
    });
    
    await db.close();
    
    // Převod na MB
    return totalSize / (1024 * 1024);
  } catch (error) {
    console.error('Chyba při výpočtu velikosti úložiště:', error);
    return 0;
  }
}

/**
 * Uloží metadata o stažené offline mapě
 */
function saveOfflineMapMetadata(metadata: OfflineMapMetadata): void {
  localStorage.setItem('offlineMapMetadata', JSON.stringify(metadata));
}

/**
 * Získá metadata o stažené offline mapě
 */
export function getOfflineMapMetadata(): OfflineMapMetadata | null {
  const data = localStorage.getItem('offlineMapMetadata');
  return data ? JSON.parse(data) : null;
}

/**
 * Kontroluje, zda jsou offline mapy k dispozici
 */
export function isOfflineMapAvailable(): boolean {
  const metadata = getOfflineMapMetadata();
  return metadata !== null && metadata.status === 'downloaded';
}

/**
 * Smaže všechny offline dlaždice
 */
export async function clearOfflineMap(): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['tiles'], 'readwrite');
    const store = transaction.objectStore('tiles');
    
    // Smazání všech dlaždic
    store.clear();
    
    await new Promise((resolve) => {
      transaction.oncomplete = resolve;
    });
    
    await db.close();
    
    // Odstranění metadat
    localStorage.removeItem('offlineMapMetadata');
    
    // Reset velikosti úložiště
    currentStorageSize = 0;
    
    console.log('Offline mapa byla smazána');
  } catch (error) {
    console.error('Chyba při mazání offline mapy:', error);
  }
}

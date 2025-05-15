/**
 * Komponenta OfflineMapManager - Rozhraní pro správu offline map
 * 
 * Tato komponenta umožňuje uživatelům stahovat, spravovat a používat offline mapy.
 * Zaměřuje se především na oblast Vysokého Mýta a okolí do 10 km.
 */
import React, { useState, useEffect } from 'react';
import styles from '../styles/OfflineMapManager.module.css';
import { 
  downloadVysokeMýtoOfflineMap, 
  getOfflineMapMetadata, 
  clearOfflineMapCache,
  getTileCacheCount
} from '../utils/mapHelpers';
import { formatFileSize } from '../utils/formatters';

interface OfflineMapManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onOfflineModeToggle: (enabled: boolean) => void;
}

const OfflineMapManager: React.FC<OfflineMapManagerProps> = ({
  isOpen,
  onClose,
  onOfflineModeToggle
}) => {
  // Stav pro sledování stažení mapy
  const [downloadStatus, setDownloadStatus] = useState<{
    downloading: boolean;
    progress: number;
    complete: boolean;
  }>({
    downloading: false,
    progress: 0,
    complete: false
  });
  
  // Stav pro metadata offline mapy
  const [mapMetadata, setMapMetadata] = useState<{
    region: string;
    centerLat: number;
    centerLng: number;
    radiusKm: number;
    minZoom: number;
    maxZoom: number;
    timestamp: string;
    tileCount: number;
  } | null>(null);
  
  // Stav pro velikost cache
  const [cacheSize, setCacheSize] = useState<string>('');
  
  // Stav pro offline režim
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  
  // Načtení metadat při otevření komponenty
  useEffect(() => {
    if (isOpen) {
      loadMapMetadata();
    }
  }, [isOpen]);
  
  // Funkce pro načtení metadat
  const loadMapMetadata = async () => {
    const metadata = getOfflineMapMetadata();
    setMapMetadata(metadata);
    setOfflineMode(!!metadata);
    
    // Odhad velikosti cache (přibližně 20KB na dlaždici)
    if (metadata) {
      const tileCount = await getTileCacheCount();
      const approximateSize = tileCount * 20 * 1024; // Přibližně 20KB na dlaždici
      setCacheSize(formatFileSize(approximateSize));
    } else {
      setCacheSize('');
    }
  };
  
  // Handler pro stažení offline mapy pro Vysoké Mýto
  const handleDownloadMap = async () => {
    if (downloadStatus.downloading) return;
    
    setDownloadStatus({
      downloading: true,
      progress: 0,
      complete: false
    });
    
    try {
      await downloadVysokeMýtoOfflineMap(
        (progress) => {
          setDownloadStatus({
            downloading: true,
            progress,
            complete: false
          });
        },
        () => {
          setDownloadStatus({
            downloading: false,
            progress: 100,
            complete: true
          });
          loadMapMetadata();
        }
      );
    } catch (error) {
      console.error('Chyba při stahování offline mapy:', error);
      setDownloadStatus({
        downloading: false,
        progress: 0,
        complete: false
      });
    }
  };
  
  // Handler pro smazání offline mapy
  const handleClearOfflineMap = async () => {
    try {
      await clearOfflineMapCache();
      setMapMetadata(null);
      setCacheSize('');
      setOfflineMode(false);
      onOfflineModeToggle(false);
      
      setDownloadStatus({
        downloading: false,
        progress: 0,
        complete: false
      });
    } catch (error) {
      console.error('Chyba při mazání offline mapy:', error);
    }
  };
  
  // Handler pro přepínání offline režimu
  const handleToggleOfflineMode = (enabled: boolean) => {
    setOfflineMode(enabled);
    onOfflineModeToggle(enabled);
  };
  
  // Formátování data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('cs-CZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className={styles.offlineMapManager}>
      <div className={styles.offlineMapContent}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Zavřít správce offline map"
        >
          &times;
        </button>
        
        <h2 className={styles.title}>Správa offline map</h2>

        <div className={styles.regionSelector}>
          <h3>Dostupné oblasti</h3>
          <div className={styles.regionOption}>
            <input 
              type="radio" 
              id="vysokeMyto" 
              name="region" 
              checked={true} 
              readOnly 
            />
            <label htmlFor="vysokeMyto">
              <strong>Vysoké Mýto a okolí (10 km)</strong>
              <p>Zahrnuje centrum města a okolní obce v dosahu 10 km</p>
            </label>
          </div>
        </div>

        {mapMetadata ? (
          <div className={styles.mapStatus}>
            <h3>Stažená offline mapa</h3>
            <div className={styles.metadataInfo}>
              <p><strong>Oblast:</strong> {mapMetadata.region}</p>
              <p><strong>Poloměr:</strong> {mapMetadata.radiusKm} km</p>
              <p><strong>Úroveň detailů:</strong> Zoom {mapMetadata.minZoom}-{mapMetadata.maxZoom}</p>
              <p><strong>Staženo:</strong> {formatDate(mapMetadata.timestamp)}</p>
              <p><strong>Velikost cache:</strong> {cacheSize}</p>
              
              <div className={styles.offlineModeToggle}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={offlineMode} 
                    onChange={(e) => handleToggleOfflineMode(e.target.checked)} 
                  />
                  Použít offline mapu
                </label>
                <p className={styles.offlineModeHelp}>
                  Při zapnutém offline režimu nebude aplikace stahovat nové mapové dlaždice z internetu.
                </p>
              </div>
              
              <button 
                className={styles.deleteButton} 
                onClick={handleClearOfflineMap}
              >
                Smazat offline mapu
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.downloadSection}>
            <h3>Stažení offline mapy</h3>
            <p>
              Pro použití aplikace bez připojení k internetu si můžete stáhnout mapové podklady předem.
              Mapa pro Vysoké Mýto a okolí zabere přibližně 50-100 MB místa v paměti zařízení.
            </p>
            
            <button 
              className={styles.downloadButton} 
              onClick={handleDownloadMap}
              disabled={downloadStatus.downloading}
            >
              {downloadStatus.downloading ? 'Stahování...' : 'Stáhnout mapu Vysokého Mýta'}
            </button>
            
            {downloadStatus.downloading && (
              <div className={styles.progressWrapper}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{width: `${downloadStatus.progress}%`}}
                  ></div>
                </div>
                <div className={styles.progressText}>
                  {Math.round(downloadStatus.progress)}%
                </div>
              </div>
            )}

            <p className={styles.downloadWarning}>
              Pro stažení celé mapy je nutné připojení k internetu. 
              Stahování může trvat několik minut.
            </p>
          </div>
        )}

        <div className={styles.infoSection}>
          <h3>Informace o offline mapách</h3>
          <ul>
            <li>Offline mapy umožňují používat aplikaci bez připojení k internetu.</li>
            <li>Stažená data jsou uložena pouze ve vašem zařízení.</li>
            <li>Mapové podklady zabírají místo ve vašem zařízení.</li>
            <li>Pro aktualizaci mapy je nutné smazat starou a stáhnout novou verzi.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OfflineMapManager;

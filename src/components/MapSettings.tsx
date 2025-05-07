import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from '../styles/MapSettings.module.css';

interface MapSettingsProps {
  centerOnUser: () => void;
  toggleFullscreen: (isFullscreen: boolean) => void;
  isFullscreen: boolean;
  downloadOfflineMap: () => void;
  isOfflineMapDownloaded: boolean;
  isDownloadingOfflineMap: boolean;
  downloadProgress: number;
}

const MapSettings: React.FC<MapSettingsProps> = ({
  centerOnUser,
  toggleFullscreen,
  isFullscreen,
  downloadOfflineMap,
  isOfflineMapDownloaded,
  isDownloadingOfflineMap,
  downloadProgress
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { playerProgress } = useGameStore();

  // Zavření menu při kliknutí mimo něj
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Funkce pro přepínání otevření/zavření menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Zobrazení počtu kroků a vzdálenosti
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(2)} km`;
    }
  };

  return (
    <div className={styles.settingsContainer} ref={menuRef}>
      {/* Zobrazení statistik pod avatarem */}
      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <span>Kroky:</span> {playerProgress.steps}
        </div>
        <div className={styles.statItem}>
          <span>Vzdálenost:</span> {formatDistance(playerProgress.distance)}
        </div>
      </div>

      {/* Tlačítko pro otevření nastavení (ozubené kolečko) */}
      <button 
        onClick={toggleMenu} 
        className={styles.settingsButton}
        aria-label="Nastavení mapy"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
      </button>

      {/* Rozbalovací menu s nastavením */}
      {isOpen && (
        <div className={styles.menuContainer}>
          <ul className={styles.menuList}>
            <li>
              <button onClick={() => {
                centerOnUser();
                setIsOpen(false);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm4.51-8.95C17.41 8.99 18 10.43 18 12c0 1.57-.59 3.01-1.49 4.01l1.52 1.52C19.27 15.93 20 14.04 20 12c0-2.04-.73-3.93-1.97-5.53l-1.52 1.58zm-9.02 0l-1.52-1.58C4.73 8.07 4 9.96 4 12c0 2.04.73 3.93 1.97 5.53l1.52-1.52C6.59 15.01 6 13.57 6 12c0-1.57.59-3.01 1.49-4.01z"/>
                </svg>
                Centrovat na moji polohu
              </button>
            </li>
            <li>
              <button onClick={() => {
                toggleFullscreen(!isFullscreen);
                setIsOpen(false);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  {isFullscreen ? (
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  ) : (
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  )}
                </svg>
                {isFullscreen ? 'Ukončit režim celé obrazovky' : 'Zobrazit na celou obrazovku'}
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  downloadOfflineMap();
                  setIsOpen(false);
                }}
                disabled={isOfflineMapDownloaded || isDownloadingOfflineMap}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
                </svg>
                {isDownloadingOfflineMap ? 
                  `Stahování ${downloadProgress}%` : 
                  isOfflineMapDownloaded ? 
                  'Offline mapa stažena' : 
                  'Stáhnout offline mapu'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapSettings;
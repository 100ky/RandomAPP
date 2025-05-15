/**
 * Komponenta MapSettings - Poskytuje nastavení a ovládací prvky pro mapu
 * 
 * Tato komponenta zobrazuje rozbalovací menu s možnostmi pro ovládání mapy,
 * jako je centrování na uživatele, přepnutí na celou obrazovku, přepínání mapových vrstev
 * a stažení offline verze mapy. Také zobrazuje statistiky hráče - kroky a vzdálenost.
 */
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/MapSettings.module.css';
import ToggleThemeButton from './ToggleThemeButton';

// Interface pro props ikon
interface IconProps {
  size?: number;
  className?: string;
}

// Komponenty ikon - náhrada za import z lucide-react
const CogIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
    <path d="M12 2v2"></path>
    <path d="M12 22v-2"></path>
    <path d="m17 20.66-1-1.73"></path>
    <path d="M11 10.27 7 3.34"></path>
    <path d="m20.66 17-1.73-1"></path>
    <path d="m3.34 7 1.73 1"></path>
    <path d="M14 12h8"></path>
    <path d="M2 12h2"></path>
    <path d="m20.66 7-1.73 1"></path>
    <path d="m3.34 17 1.73-1"></path>
    <path d="m17 3.34-1 1.73"></path>
    <path d="m7 20.66-1-1.73"></path>
  </svg>
);

const MapPinIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const DownloadIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const PlayIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

/**
 * Typ definující dostupné mapové vrstvy
 */
export type MapLayerType = 'streets' | 'satellite' | 'terrain' | 'dark';

/**
 * Props pro komponentu MapSettings
 */
interface MapSettingsProps {
  centerOnUser: () => void;                    // Funkce pro vycentrování mapy na aktuální polohu uživatele
  downloadOfflineMap?: () => void;             // Funkce pro stažení offline verze mapy
  isOfflineMapDownloaded?: boolean;            // Indikátor, zda byla offline mapa již stažena
  isDownloadingOfflineMap?: boolean;           // Indikátor, zda právě probíhá stahování mapy
  downloadProgress?: number;                   // Průběh stahování v procentech (0-100)
  currentMapLayer?: MapLayerType;              // Aktuálně vybraná mapová vrstva
  onMapLayerChange?: (layer: MapLayerType) => void; // Callback pro změnu mapové vrstvy
  showPointsOfInterest?: boolean;              // Indikátor, zda zobrazovat body zájmu
  togglePointsOfInterest?: () => void;         // Přepínání viditelnosti bodů zájmu
  weatherEnabled?: boolean;                    // Indikátor, zda je povoleno zobrazení počasí
  toggleWeather?: () => void;                  // Přepínání zobrazení počasí
  onPauseGame?: () => void;                    // Funkce pro pozastavení hry
  onEndGame?: () => void;                      // Funkce pro ukončení hry
  isGameRunning?: boolean;                     // Indikátor, zda je hra aktivní
  isPaused?: boolean;                          // Indikátor, zda je hra pozastavena
  onCenterMap?: () => void;                    // Funkce pro centrování mapy (změněno na volitelné)
  onDownloadMap?: () => void;                  // Funkce pro stažení mapy (změněno na volitelné)
  isGamePaused?: boolean;                      // Indikátor, zda je hra pozastavena (změněno na volitelné)
  onTogglePauseGame?: () => void;              // Funkce pro přepnutí pozastavení hry (změněno na volitelné)
  currentZoom?: number;                        // Aktuální zoom mapy (změněno na volitelné)
  currentPosition?: { lat: number; lng: number }; // Aktuální pozice na mapě (změněno na volitelné)
  maxZoom?: number;                            // Maximální povolený zoom mapy
}

/**
 * Formátuje vzdálenost v metrech na čitelný řetězec
 * Převádí metry na kilometry, pokud je vzdálenost větší než 1000m
 */
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * Komponenta nabízející nastavení a ovládání mapy
 */
const MapSettings: React.FC<MapSettingsProps> = ({
  centerOnUser,
  downloadOfflineMap = () => {},
  isOfflineMapDownloaded = false,
  isDownloadingOfflineMap = false,
  downloadProgress = 0,
  currentMapLayer = 'streets',
  onMapLayerChange,
  showPointsOfInterest = true,
  togglePointsOfInterest,
  weatherEnabled = false,
  toggleWeather,
  onPauseGame,
  onEndGame,
  isGameRunning = false,
  isPaused = false,
  onCenterMap = () => {},
  onDownloadMap = () => {},
  isGamePaused = false,
  onTogglePauseGame = () => {},
  currentZoom = 15,
  currentPosition = { lat: 49.95, lng: 16.16 },
  maxZoom = 18,
}) => {
  // Stav určující, zda je menu nastavení otevřené
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // Reference na DOM element menu pro detekci kliknutí mimo menu
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Výpočet, jak blízko je uživatel k maximálnímu zoomu (procento)
  const zoomPercentage = Math.min(100, Math.max(0, (currentZoom / maxZoom) * 100));

  // Zavření menu při kliknutí mimo něj
  useEffect(() => {
    /**
     * Zpracování kliknutí mimo menu - zavře menu, pokud bylo kliknuto vně
     */
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Přidání posluchače událostí pouze když je menu otevřené
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Odstranění posluchače při unmount nebo když se změní stav isOpen
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.mapSettingsContainer} ref={menuRef}>
      <button
        className={`${styles.settingsButton} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Nastavení mapy"
        aria-expanded={isOpen}
      >
        <CogIcon size={24} />
      </button>
      {isOpen && (
        <div className={styles.menu} role="menu">
          <ul className={styles.menuList}>
            <li className={styles.menuItem} role="none">
              <button onClick={onCenterMap} className={styles.menuButton} role="menuitem">
                <MapPinIcon size={18} className={styles.menuIcon} />
                Centrovat na mé místo
              </button>
            </li>
            <li className={styles.menuItem} role="none">
              <button onClick={onDownloadMap} className={styles.menuButton} role="menuitem">
                <DownloadIcon size={18} className={styles.menuIcon} />
                Stáhnout mapu offline
              </button>
            </li>
            <li className={styles.menuItem} role="none">
              <button onClick={onTogglePauseGame} className={styles.menuButton} role="menuitem">
                {isGamePaused ? (
                  <PlayIcon size={18} className={styles.menuIcon} />
                ) : (
                  <PauseIcon size={18} className={styles.menuIcon} />
                )}
                {isGamePaused ? 'Pokračovat ve hře' : 'Pozastavit hru'}
              </button>
            </li>
            {/* Přidání tlačítka pro přepínání motivu */}
            <li className={`${styles.menuItem} ${styles.themeToggleMenuItem}`} role="none">
              <ToggleThemeButton className={styles.menuButton} />
            </li>
          </ul>
          <div className={styles.menuFooter}>
            <p>
              Zoom: {typeof currentZoom === 'number' ? currentZoom.toFixed(2) : 'N/A'} 
              {zoomPercentage > 85 && (
                <span className={styles.zoomWarning}> (Blízko maximu)</span>
              )}
            </p>
            
            {/* Indikátor přiblížení */}
            <div className={styles.zoomIndicator}>
              <div 
                className={`${styles.zoomIndicatorFill} ${zoomPercentage > 85 ? styles.zoomIndicatorWarning : ''}`}
                style={{ width: `${zoomPercentage}%` }}
              />
            </div>
            
            {/* Ovládání zoomu */}
            <div className={styles.zoomControls}>
              <button 
                className={styles.zoomButton} 
                onClick={() => onCenterMap && onCenterMap()}
                title="Centrovat na mou polohu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24">
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="currentColor"/>
                </svg>
              </button>
              
              <button 
                className={styles.zoomButton} 
                onClick={() => window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))}
                title="Oddálit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24">
                  <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            
            <p>Pozice: {currentPosition && currentPosition.lat ? currentPosition.lat.toFixed(4) : 'N/A'}, {currentPosition && currentPosition.lng ? currentPosition.lng.toFixed(4) : 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSettings;
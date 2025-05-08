/**
 * Komponenta MapSettings - Poskytuje nastavení a ovládací prvky pro mapu
 * 
 * Tato komponenta zobrazuje rozbalovací menu s možnostmi pro ovládání mapy,
 * jako je centrování na uživatele, přepnutí na celou obrazovku, přepínání mapových vrstev
 * a stažení offline verze mapy. Také zobrazuje statistiky hráče - kroky a vzdálenost.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from '../styles/MapSettings.module.css';

/**
 * Typ definující dostupné mapové vrstvy
 */
export type MapLayerType = 'streets' | 'satellite' | 'terrain' | 'dark';

/**
 * Props pro komponentu MapSettings
 */
interface MapSettingsProps {
  centerOnUser: () => void;                    // Funkce pro vycentrování mapy na aktuální polohu uživatele
  toggleFullscreen: (isFullscreen: boolean) => void; // Funkce pro přepínání režimu celé obrazovky
  isFullscreen: boolean;                       // Indikátor, zda je mapa v režimu celé obrazovky
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
  toggleFullscreen,
  isFullscreen,
  downloadOfflineMap = () => {},
  isOfflineMapDownloaded = false,
  isDownloadingOfflineMap = false,
  downloadProgress = 0,
  currentMapLayer = 'streets',
  onMapLayerChange,
  showPointsOfInterest = true,
  togglePointsOfInterest,
  weatherEnabled = false,
  toggleWeather
}) => {
  // Stav určující, zda je menu nastavení otevřené
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // Reference na DOM element menu pro detekci kliknutí mimo menu
  const menuRef = useRef<HTMLDivElement>(null);
  // Přístup k hernímu stavu a statistikám hráče
  const playerProgress = useGameStore(state => state.playerProgress);

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

  /**
   * Přepíná stav otevření/zavření menu nastavení
   */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Povolení prvků v menu podle podporovaných funkcí
  const hasLayerSupport = !!onMapLayerChange;
  const hasPoiSupport = !!togglePointsOfInterest;
  const hasWeatherSupport = !!toggleWeather;
  const hasOfflineSupport = !!downloadOfflineMap;

  return (
    <div className={styles.settingsContainer}>
      {/* Statistiky hry */}
      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <span>Vyřešeno:</span> {playerProgress.solvedPuzzles}/{playerProgress.totalPuzzles}
        </div>
        <div className={styles.statItem}>
          <span>Vzdálenost:</span> {formatDistance(playerProgress.distanceTraveled)}
        </div>
        <div className={styles.statItem}>
          <span>Skóre:</span> {playerProgress.score} bodů
        </div>
      </div>

      {/* Tlačítko pro otevření menu */}
      <button className={styles.settingsButton} onClick={toggleMenu} aria-label="Nastavení mapy">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>

      {/* Menu s nastavením */}
      {isOpen && (
        <div className={styles.menuContainer} ref={menuRef}>
          <ul className={styles.menuList}>
            {/* Centrování mapy na uživatele */}
            <li>
              <button onClick={() => {
                centerOnUser();
                setIsOpen(false);
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 3L14.5 21a.55.55 0 01-1 0L10 14l-6.5-3.5a.55.55 0 010-1L21 3" />
                </svg>
                Centrovat na mé místo
              </button>
            </li>

            {/* Podmenu pro výběr mapové vrstvy */}
            {hasLayerSupport && (
              <li className={styles.submenuContainer}>
                <div className={styles.submenuTitle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Mapová vrstva
                </div>
                <div className={styles.submenuItems}>
                  <button 
                    className={`${styles.layerButton} ${currentMapLayer === 'streets' ? styles.activeLayer : ''}`}
                    onClick={() => onMapLayerChange && onMapLayerChange('streets')}
                  >
                    Ulice
                  </button>
                  <button 
                    className={`${styles.layerButton} ${currentMapLayer === 'satellite' ? styles.activeLayer : ''}`}
                    onClick={() => onMapLayerChange && onMapLayerChange('satellite')}
                  >
                    Satelitní
                  </button>
                  <button 
                    className={`${styles.layerButton} ${currentMapLayer === 'terrain' ? styles.activeLayer : ''}`}
                    onClick={() => onMapLayerChange && onMapLayerChange('terrain')}
                  >
                    Terénní
                  </button>
                  <button 
                    className={`${styles.layerButton} ${currentMapLayer === 'dark' ? styles.activeLayer : ''}`}
                    onClick={() => onMapLayerChange && onMapLayerChange('dark')}
                  >
                    Tmavý
                  </button>
                </div>
              </li>
            )}

            {/* Přepínač bodů zájmu */}
            {hasPoiSupport && (
              <li>
                <button onClick={() => togglePointsOfInterest && togglePointsOfInterest()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {showPointsOfInterest ? 'Skrýt body zájmu' : 'Zobrazit body zájmu'}
                </button>
              </li>
            )}

            {/* Přepínač počasí */}
            {hasWeatherSupport && (
              <li>
                <button onClick={() => toggleWeather && toggleWeather()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  {weatherEnabled ? 'Vypnout počasí' : 'Zobrazit počasí'}
                </button>
              </li>
            )}

            {/* Stažení offline mapy */}
            {hasOfflineSupport && (
              <li>
                <button 
                  disabled={isOfflineMapDownloaded || isDownloadingOfflineMap}
                  onClick={() => {
                    downloadOfflineMap();
                    // Necháme menu otevřené, aby uživatel viděl stav stahování
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {isOfflineMapDownloaded 
                    ? 'Offline mapa stažena' 
                    : isDownloadingOfflineMap 
                      ? `Stahování (${downloadProgress}%)` 
                      : 'Stáhnout mapu offline'}
                </button>
              </li>
            )}

            {/* Přepínač celé obrazovky */}
            <li>
              <button onClick={() => {
                toggleFullscreen(!isFullscreen);
                setIsOpen(false);
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isFullscreen ? (
                    <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                  ) : (
                    <path d="M3 8h3a2 2 0 002-2V3m13 5h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                  )}
                </svg>
                {isFullscreen ? 'Ukončit celou obrazovku' : 'Zobrazit na celé obrazovce'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapSettings;
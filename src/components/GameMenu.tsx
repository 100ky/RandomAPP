import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from '../styles/GameMenu.module.css';

interface GameMenuProps {
  onPauseGame: () => void;
  onResumeGame: () => void;
  onEndGame: () => void;
  downloadOfflineMaps: () => void;
  isOfflineMode: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  isPaused?: boolean;
  isGameRunning?: boolean;
}

const GameMenu: React.FC<GameMenuProps> = ({
  onPauseGame,
  onResumeGame, 
  onEndGame,
  downloadOfflineMaps,
  isOfflineMode,
  isDownloading,
  downloadProgress,
  isPaused = false,
  isGameRunning = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const { playerProgress, getElapsedTime } = useGameStore();
  
  // Zavřít menu při kliknutí mimo něj
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Efekt pro aktualizaci času každou sekundu, když hra běží
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (isGameRunning && !isPaused) {
      timerId = setInterval(() => {
        setElapsedTime(getElapsedTime());
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isGameRunning, isPaused, getElapsedTime]);
  
  // Přepínání menu otevřeno/zavřeno
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Formátování vzdálenosti pro zobrazení
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(2)} km`;
    }
  };
  
  // Formátování času ve formátu HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours > 0 ? hours : null,
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };
  
  // Zpracování kliknutí na pozastavení/pokračování hry
  const handlePauseToggle = () => {
    if (isPaused) {
      onResumeGame();
    } else {
      onPauseGame();
    }
    setIsMenuOpen(false);
  };
  
  // Zpracování kliknutí na stažení offline map
  const handleDownloadMaps = () => {
    downloadOfflineMaps();
    setIsMenuOpen(false);
  };
  
  // Zpracování kliknutí na ukončení hry
  const handleEndGame = () => {
    if (window.confirm('Opravdu chcete ukončit hru?')) {
      onEndGame();
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Tlačítko pro otevření menu (ozubené kolo) - vpravo nahoře */}
      <div className="game-menu-button-container" ref={menuRef}>
        <button 
          onClick={toggleMenu} 
          className="menu-button control-button-base"
          aria-label="Herní menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>
        
        {/* Rozbalovací menu */}
        {isMenuOpen && (
          <div className="menu-dropdown">
            <ul className="menu-list">
              <li>
                <button onClick={handlePauseToggle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    {isPaused ? (
                      <path d="M8 5v14l11-7z"/> // Play icon
                    ) : (
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/> // Pause icon
                    )}
                  </svg>
                  {isPaused ? 'Pokračovat ve hře' : 'Pozastavit hru'}
                </button>
              </li>
              <li>
                <button 
                  onClick={handleDownloadMaps}
                  disabled={isOfflineMode || isDownloading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
                  </svg>
                  {isDownloading ? 
                    `Stahování ${downloadProgress}%` : 
                    isOfflineMode ? 
                    'Offline mapy staženy' : 
                    'Stáhnout offline mapy'}
                </button>
              </li>
              <li>
                <button onClick={handleEndGame}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                  Ukončit hru
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Zobrazení statistik - přesunuto doleva pod avatar */}
      {isGameRunning && (
        <div className="player-stats-container">
          <div className="stats-container">
            <div className="stat-item time-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <span className="stat-label">Čas:</span> 
              <span className="stat-value">{formatTime(elapsedTime)}</span>
            </div>
            <div className="stat-item steps-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
              </svg>
              <span className="stat-label">Kroky:</span> 
              <span className="stat-value">{playerProgress.steps}</span>
            </div>
            <div className="stat-item distance-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M21.41 10.59l-7.99-8c-.78-.78-2.05-.78-2.83 0l-8.01 8c-.78.78-.78 2.05 0 2.83l8.01 8c.78.78 2.05.78 2.83 0l7.99-8c.79-.79.79-2.05 0-2.83zM13.5 14.5V12H10v3H8v-4c0-.55.45-1 1-1h4.5V7.5L17 11l-3.5 3.5z"/>
              </svg>
              <span className="stat-label">Vzdálenost:</span> 
              <span className="stat-value">{formatDistance(playerProgress.distanceMeters)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameMenu;
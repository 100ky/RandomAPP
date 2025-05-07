import React, { useState, useEffect } from 'react';

interface FullscreenToggleProps {
  targetId: string;
  type: 'map' | 'camera';
  onToggle?: (isFullscreen: boolean) => void;
}

const FullscreenToggle: React.FC<FullscreenToggleProps> = ({ targetId, type, onToggle }) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Sledování změn fullscreen režimu
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);
      if (onToggle) {
        onToggle(isCurrentlyFullscreen);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onToggle]);
  
  // Funkce pro přepnutí fullscreen režimu
  const toggleFullscreen = () => {
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) {
      console.error(`Element s ID "${targetId}" nebyl nalezen pro fullscreen.`);
      return;
    }
    
    if (!isFullscreen) {
      // Přepnutí do fullscreen režimu
      if (targetElement.requestFullscreen) {
        targetElement.requestFullscreen()
          .catch(err => {
            console.error(`Chyba při přepnutí do fullscreen režimu: ${err.message}`);
          });
      }
      // Přidat třídu pro speciální styly
      targetElement.classList.add('map-fullscreen');
      
      // Force otočení obrazovky do landscape režimu, pokud zařízení podporuje
      if ('orientation' in screen) {
        try {
          // Pro iOS a moderní prohlížeče
          screen.orientation.lock('landscape')
            .catch(() => console.log('Otočení obrazovky není podporováno'));
        } catch (error) {
          console.log('API pro orientaci obrazovky není podporováno');
        }
      }
    } else {
      // Ukončení fullscreen režimu
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .catch(err => {
            console.error(`Chyba při ukončení fullscreen režimu: ${err.message}`);
          });
      }
      // Odstranit třídu pro speciální styly
      targetElement.classList.remove('map-fullscreen');
      
      // Uvolnění zámku orientace
      if ('orientation' in screen) {
        try {
          screen.orientation.unlock();
        } catch (error) {
          console.log('Uvolnění orientace není podporováno');
        }
      }
    }
  };

  // Určení správné třídy a textu tlačítka podle typu
  const buttonClassName = type === 'map' ? 'fullscreen-map-button' : 'fullscreen-camera-button';
  const tooltipText = isFullscreen ? 'Ukončit režim celé obrazovky' : 'Zobrazit na celou obrazovku';

  return (
    <button 
      className={buttonClassName}
      onClick={toggleFullscreen}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <div className={isFullscreen ? 'exit-fullscreen-icon' : 'fullscreen-icon'} />
    </button>
  );
};

export default FullscreenToggle;
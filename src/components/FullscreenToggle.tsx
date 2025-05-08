/**
 * Komponenta FullscreenToggle - Umožňuje přepínání režimu celé obrazovky
 * 
 * Tato komponenta poskytuje tlačítko pro přepínání mezi normálním zobrazením
 * a režimem celé obrazovky pro mapu nebo kameru. Při aktivaci režimu celé obrazovky
 * se také pokusí na mobilních zařízeních přepnout na landscape (vodorovný) režim.
 */
import React, { useState, useEffect } from 'react';

/**
 * Props pro komponentu FullscreenToggle
 */
interface FullscreenToggleProps {
  targetId: string;                          // ID HTML elementu, který má být zobrazen na celou obrazovku
  type: 'map' | 'camera';                    // Typ komponenty pro správné styly (mapa nebo kamera)
  onToggle?: (isFullscreen: boolean) => void; // Volitelný callback při přepnutí stavu
}

/**
 * Komponenta pro přepínání režimu celé obrazovky
 */
const FullscreenToggle: React.FC<FullscreenToggleProps> = ({ targetId, type, onToggle }) => {
  // Stav uchovávající informaci o tom, zda je aktivní režim celé obrazovky
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Sledování změn fullscreen režimu pomocí naslouchání události fullscreenchange
  useEffect(() => {
    /**
     * Zpracování události změny režimu celé obrazovky
     * Aktualizuje stav komponenty a volá callback, pokud byl poskytnut
     */
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);
      if (onToggle) {
        onToggle(isCurrentlyFullscreen);
      }
    };
    
    // Přidání posluchače události
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Odstranění posluchače události při odinstalování komponenty
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onToggle]);
  
  /**
   * Funkce pro přepnutí mezi režimem celé obrazovky a normálním režimem
   */
  const toggleFullscreen = () => {
    // Získání cílového elementu podle ID
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
      // Přidat třídu pro speciální styly při zobrazení na celou obrazovku
      targetElement.classList.add('map-fullscreen');
      
      // Pokus o otočení obrazovky do landscape režimu, pokud zařízení podporuje
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
      // Odstranění třídy pro speciální styly
      targetElement.classList.remove('map-fullscreen');
      
      // Uvolnění zámku orientace obrazovky
      if ('orientation' in screen) {
        try {
          screen.orientation.unlock();
        } catch (error) {
          console.log('Uvolnění orientace není podporováno');
        }
      }
    }
  };

  // Určení správné CSS třídy a textu tlačítka podle typu (mapa nebo kamera) a aktuálního stavu
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
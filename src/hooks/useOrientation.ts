import { useState, useEffect } from 'react';

/**
 * Hook pro detekci orientace zařízení, typu zařízení a optimalizace vykreslování
 * @returns {{ isLandscape: boolean, orientation: string, windowWidth: number, windowHeight: number, isAndroid: boolean, isSamsung: boolean, isLowPerformance: boolean }} 
 * Objekt obsahující informace o orientaci, velikosti okna a typu zařízení
 */
export function useOrientation() {
  // Kontrola typu zařízení a výkonu, pokud je dostupná
  const isAndroidDevice = typeof navigator !== 'undefined' ? /Android/.test(navigator.userAgent) : false;
  const isSamsungDevice = typeof navigator !== 'undefined' ? /SM-|SAMSUNG/.test(navigator.userAgent) : false;
  
  // Detekce starých zařízení nebo nízkovýkonných zařízení
  const isOldAndroid = isAndroidDevice && typeof navigator !== 'undefined' ? 
    (/Android 4\./.test(navigator.userAgent) || /Android 5\./.test(navigator.userAgent)) : false;
  
  // Odhad nízkovýkonných zařízení
  const isLowPerformance = isOldAndroid || 
    (typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory < 4);
  
  // Výchozí hodnoty
  const [state, setState] = useState({
    isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false,
    orientation: typeof window !== 'undefined' ? (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait') : 'portrait',
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    isAndroid: isAndroidDevice,
    isSamsung: isSamsungDevice,
    isLowPerformance: isLowPerformance
  });
  useEffect(() => {
    /**
     * Aktualizuje stav orientace při změně velikosti okna
     */
    const handleResize = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setState({
        isLandscape: landscape,
        orientation: landscape ? 'landscape' : 'portrait',
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        isAndroid: isAndroidDevice,
        isSamsung: isSamsungDevice,
        isLowPerformance: isLowPerformance
      });
      
      // Aktualizuje CSS třídy na kořenovém elementu
      if (landscape) {
        document.documentElement.classList.add('landscape-orientation');
        document.documentElement.classList.remove('portrait-orientation');
      } else {
        document.documentElement.classList.add('portrait-orientation');
        document.documentElement.classList.remove('landscape-orientation');
      }
      
      // Detekce velmi malého displeje
      const isSmallScreen = window.innerWidth < 480 || window.innerHeight < 480;
      document.documentElement.classList.toggle('small-screen', isSmallScreen);
      
      // Přidání tříd pro specifická zařízení
      if (isAndroidDevice) {
        document.documentElement.classList.add('android-device');
      }
      
      if (isSamsungDevice) {
        document.documentElement.classList.add('samsung-device');
      }
      
      if (isOldAndroid) {
        document.documentElement.classList.add('old-device');
      }
      
      if (isLowPerformance) {
        document.documentElement.classList.add('low-performance-device');
      }
    };

    // Přiřazení event handleru pro změnu velikosti okna
    window.addEventListener('resize', handleResize);
    
    // Počáteční nastavení CSS tříd
    handleResize();
    
    // Kontrola orientace při změně orientace na mobilních zařízeních
    window.addEventListener('orientationchange', handleResize);
    
    // Odstraníme event listenery při unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isAndroidDevice]);

  return state;
}

export default useOrientation;
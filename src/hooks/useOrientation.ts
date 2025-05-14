/**
 * Hook pro detekci orientace zařízení, typu zařízení a optimalizace vykreslování
 * Tento hook poskytuje informace o aktuální orientaci zařízení, velikosti okna
 * a typu zařízení pro optimalizaci vykreslování.
 */
import { useState, useEffect } from 'react';

interface OrientationState {
  isLandscape: boolean;        // Zda je zařízení v landscape módu
  orientation: string;         // 'landscape' nebo 'portrait'
  windowWidth: number;         // Šířka okna v pixelech
  windowHeight: number;        // Výška okna v pixelech
  isAndroid: boolean;          // Zda je zařízení Android
  isIOS: boolean;              // Zda je zařízení iOS
  isSamsung: boolean;          // Zda je zařízení Samsung
  isLowPerformance: boolean;   // Zda má zařízení nižší výkon
  isSmallScreen: boolean;      // Zda má zařízení malý displej
}

/**
 * Hook pro detekci orientace zařízení a dalších vlastností zařízení
 * @returns Objekt obsahující informace o orientaci, velikosti okna a typu zařízení
 */
export default function useOrientation(): OrientationState {
  // Kontrola typu zařízení a výkonu, pokud je dostupná
  const isAndroidDevice = typeof navigator !== 'undefined' ? /Android/.test(navigator.userAgent) : false;
  const isIOSDevice = typeof navigator !== 'undefined' ? /iPhone|iPad|iPod/.test(navigator.userAgent) : false;
  const isSamsungDevice = typeof navigator !== 'undefined' ? /SM-|SAMSUNG/.test(navigator.userAgent) : false;
  
  // Detekce starých zařízení nebo nízkovýkonných zařízení
  const isOldAndroid = isAndroidDevice && typeof navigator !== 'undefined' ? 
    (/Android 4\./.test(navigator.userAgent) || /Android 5\./.test(navigator.userAgent)) : false;
  
  // Odhad nízkovýkonných zařízení
  const isLowPerformance = isOldAndroid || 
    (typeof navigator !== 'undefined' && 
     // @ts-ignore - ne všechny prohlížeče podporují deviceMemory
     (navigator.deviceMemory !== undefined && navigator.deviceMemory < 4));
  
  // Výchozí hodnoty
  const initialWindowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const initialWindowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  
  const [state, setState] = useState<OrientationState>({
    isLandscape: initialWindowWidth > initialWindowHeight,
    orientation: initialWindowWidth > initialWindowHeight ? 'landscape' : 'portrait',
    windowWidth: initialWindowWidth,
    windowHeight: initialWindowHeight,
    isAndroid: isAndroidDevice,
    isIOS: isIOSDevice,
    isSamsung: isSamsungDevice,
    isLowPerformance: isLowPerformance,
    // Použijeme konzistentní logiku pro isSmallScreen
    isSmallScreen: initialWindowWidth < 480 || initialWindowHeight < 480 
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    /**
     * Aktualizuje stav orientace při změně velikosti okna
     */
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const landscape = width > height;
      
      setState({
        isLandscape: landscape,
        orientation: landscape ? 'landscape' : 'portrait',
        windowWidth: width,
        windowHeight: height,
        isAndroid: isAndroidDevice,
        isIOS: isIOSDevice,
        isSamsung: isSamsungDevice,
        isLowPerformance: isLowPerformance,
        // Použijeme konzistentní logiku pro isSmallScreen
        isSmallScreen: width < 480 || height < 480
      });
      
      // Aktualizuje CSS třídy na kořenovém elementu
      document.documentElement.classList.toggle('landscape-orientation', landscape);
      document.documentElement.classList.toggle('portrait-orientation', !landscape);
      
      // Detekce velmi malého displeje
      const smallScreen = width < 480 || height < 480;
      document.documentElement.classList.toggle('small-screen', smallScreen);
      
      // Přidání tříd pro specifická zařízení
      document.documentElement.classList.toggle('android-device', isAndroidDevice);
      document.documentElement.classList.toggle('ios-device', isIOSDevice); // Přidáno pro iOS
      document.documentElement.classList.toggle('samsung-device', isSamsungDevice);
      document.documentElement.classList.toggle('old-device', isOldAndroid);
      document.documentElement.classList.toggle('low-performance-device', isLowPerformance);
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
  }, [isAndroidDevice, isIOSDevice, isSamsungDevice, isLowPerformance]);

  return state;
}
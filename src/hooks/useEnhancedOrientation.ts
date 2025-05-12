import { useState, useEffect } from 'react';

/**
 * Rozšířené informace o orientaci a zařízení
 * @interface DeviceOrientation
 */
interface DeviceOrientation {
  isLandscape: boolean;
  orientation: string;
  windowWidth: number;
  windowHeight: number;
  isAndroid: boolean;
  isSamsung: boolean;
  isOldDevice: boolean;
  isLowPerformance: boolean;
  isIOS: boolean;
  devicePixelRatio: number;
  inTestMode: boolean;
  simulatedDevice: string | null;
}

/**
 * Rozšířený hook pro detekci orientace a parametrů zařízení
 * @returns {DeviceOrientation} Objekt obsahující informace o orientaci a zařízení
 */
export function useEnhancedOrientation(): DeviceOrientation {
  // Detekce typu zařízení
  const isAndroidDevice = typeof navigator !== 'undefined' ? /Android/.test(navigator.userAgent) : false;
  const isSamsungDevice = typeof navigator !== 'undefined' ? /SM-|SAMSUNG/.test(navigator.userAgent) : false;
  const isIOSDevice = typeof navigator !== 'undefined' ? /iPhone|iPad|iPod/.test(navigator.userAgent) : false;
  
  // Detekce starých nebo nízkovýkonných zařízení
  const isOldDevice = isAndroidDevice && typeof navigator !== 'undefined' ? 
    (/Android [2-5]\./.test(navigator.userAgent)) : false;
  
  // Přibližný odhad nízkovýkonných zařízení na základě dostupných API
  const detectLowPerformance = () => {
    if (typeof navigator === 'undefined') return false;
    
    // Kontrola paměti zařízení (pokud je API dostupné)
    const hasLowMemory = 'deviceMemory' in navigator && 
      // @ts-ignore - deviceMemory není standardně v TypeScript typech
      (navigator.deviceMemory < 4);
    
    // Kontrola počtu jader CPU (pokud je API dostupné)
    const hasLowCPU = 'hardwareConcurrency' in navigator && 
      navigator.hardwareConcurrency < 4;
    
    // Nízký poměr pixelů může naznačovat starší zařízení
    const hasLowPixelRatio = window.devicePixelRatio < 2;
    
    // Staré prohlížeče nebo starší Android mohou být nízkovýkonná zařízení
    const isOldBrowser = /Android [2-5]\./.test(navigator.userAgent) ||
      /MSIE|Trident/.test(navigator.userAgent);
    
    return hasLowMemory || hasLowCPU || (hasLowPixelRatio && isOldBrowser);
  };
  
  // Kontrola testovacího režimu
  const checkTestMode = () => {
    if (typeof window === 'undefined') return false;
    
    // Kontrola, zda URL obsahuje parametr testovacího režimu
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('test-mode') || 
           window.location.pathname.includes('landscape-test') || 
           window.location.pathname.includes('responsive-test');
  };
  
  // Kontrola simulovaného typu zařízení
  const getSimulatedDevice = () => {
    if (typeof window === 'undefined') return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('device');
  };
  
  // Výchozí hodnoty
  const [state, setState] = useState<DeviceOrientation>({
    isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false,
    orientation: typeof window !== 'undefined' ? (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait') : 'portrait',
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    isAndroid: isAndroidDevice,
    isSamsung: isSamsungDevice,
    isOldDevice: isOldDevice,
    isLowPerformance: typeof window !== 'undefined' ? detectLowPerformance() : false,
    isIOS: isIOSDevice,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    inTestMode: typeof window !== 'undefined' ? checkTestMode() : false,
    simulatedDevice: typeof window !== 'undefined' ? getSimulatedDevice() : null
  });

  useEffect(() => {
    /**
     * Aktualizuje stav orientace a parametrů zařízení při změně velikosti okna
     */
    const handleResize = () => {
      const landscape = window.innerWidth > window.innerHeight;
      const inTestMode = checkTestMode();
      const simulatedDevice = getSimulatedDevice();
      
      setState({
        isLandscape: landscape,
        orientation: landscape ? 'landscape' : 'portrait',
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        isAndroid: isAndroidDevice,
        isSamsung: isSamsungDevice,
        isOldDevice: isOldDevice,
        isLowPerformance: detectLowPerformance(),
        isIOS: isIOSDevice,
        devicePixelRatio: window.devicePixelRatio,
        inTestMode: inTestMode,
        simulatedDevice: simulatedDevice
      });
      
      // Aktualizace CSS tříd na kořenovém elementu
      if (landscape) {
        document.documentElement.classList.add('landscape-orientation');
        document.documentElement.classList.remove('portrait-orientation');
      } else {
        document.documentElement.classList.add('portrait-orientation');
        document.documentElement.classList.remove('landscape-orientation');
      }
      
      // Detekce malého displeje
      const isSmallScreen = window.innerWidth < 480 || window.innerHeight < 480;
      document.documentElement.classList.toggle('small-screen', isSmallScreen);
      
      // Přidání tříd pro specifická zařízení
      document.documentElement.classList.toggle('android-device', isAndroidDevice);
      document.documentElement.classList.toggle('samsung-device', isSamsungDevice);
      document.documentElement.classList.toggle('old-device', isOldDevice);
      document.documentElement.classList.toggle('ios-device', isIOSDevice);
      document.documentElement.classList.toggle('low-performance-device', detectLowPerformance());
      
      // Přidání tříd pro testovací režim
      document.documentElement.classList.toggle('test-mode', inTestMode);
      
      // Simulované zařízení pro testování
      if (simulatedDevice) {
        document.documentElement.classList.add(`simulated-${simulatedDevice}`);
      }
    };

    // Event listenery pro změny velikosti a orientace
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Inicializace
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isAndroidDevice, isIOSDevice, isSamsungDevice, isOldDevice]);

  return state;
}

/**
 * Pro zachování zpětné kompatibility
 * @deprecated Použijte místo toho useEnhancedOrientation
 */
export function useOrientation() {
  const orientation = useEnhancedOrientation();
  return {
    isLandscape: orientation.isLandscape,
    orientation: orientation.orientation,
    windowWidth: orientation.windowWidth,
    windowHeight: orientation.windowHeight,
    isAndroid: orientation.isAndroid,
    isSamsung: orientation.isSamsung, 
    isLowPerformance: orientation.isLowPerformance
  };
}

export default useOrientation;

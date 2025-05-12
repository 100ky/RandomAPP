/**
 * Pomocné funkce pro detekci a správu parametrů zařízení
 */

/**
 * Informace o zařízení
 */
export interface DeviceInfo {
  type: 'android' | 'ios' | 'desktop' | 'unknown';
  manufacturer?: string;
  model?: string;
  isLowPerformance: boolean;
  isOldDevice: boolean;
  hasTouchScreen: boolean;
  browserName: string;
  browserVersion: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
}

/**
 * Detekuje typ prohlížeče a jeho verzi
 */
function detectBrowser(): { name: string, version: string } {
  if (typeof navigator === 'undefined') {
    return { name: 'unknown', version: 'unknown' };
  }

  const userAgent = navigator.userAgent;
  let browser = 'unknown';
  let version = 'unknown';
  
  // Detekce běžných prohlížečů
  if (userAgent.indexOf('Edge') > -1) {
    browser = 'Microsoft Edge (Legacy)';
  } else if (userAgent.indexOf('Edg') > -1) {
    browser = 'Microsoft Edge (Chromium)';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browser = 'Safari';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
    browser = 'Internet Explorer';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browser = 'Opera';
  }
  
  // Extrahování verze prohlížeče (zjednodušené)
  const match = 
    userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) ||
    userAgent.match(/version\/(\d+).+?(safari)/i);
    
  if (match && match[2]) {
    version = match[2];
  }
  
  return { name: browser, version };
}

/**
 * Odhadne, zda je zařízení nízkovýkonné
 */
function estimateLowPerformance(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }
  
  const { userAgent } = navigator;
  
  // Kontrola paměti (pokud je API dostupné)
  const hasLowMemory = 'deviceMemory' in navigator && 
    // @ts-ignore - deviceMemory není standardně v TypeScript typech
    (navigator.deviceMemory < 4);
  
  // Kontrola počtu CPU jader
  const hasLowCPU = 'hardwareConcurrency' in navigator && 
    navigator.hardwareConcurrency < 4;
  
  // Staré Android verze
  const isOldAndroid = /Android [2-5]\./.test(userAgent);
  
  // Starší iOS verze
  const isOldIOS = /iPhone|iPad|iPod/.test(userAgent) && 
    (/OS [4-9]_/.test(userAgent) || /OS 1[0-2]_/.test(userAgent));
  
  // Nízké rozlišení obrazovky a staré zařízení mohou indikovat nízký výkon
  const hasLowResolution = window.screen.width * window.screen.height <= 1024 * 768;
  
  return hasLowMemory || hasLowCPU || isOldAndroid || isOldIOS || 
         (hasLowResolution && (isOldAndroid || isOldIOS));
}

/**
 * Získá informace o zařízení
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      type: 'unknown',
      isLowPerformance: false,
      isOldDevice: false,
      hasTouchScreen: false,
      browserName: 'unknown',
      browserVersion: 'unknown',
      screenWidth: 0,
      screenHeight: 0,
      devicePixelRatio: 1
    };
  }
  
  const { userAgent } = navigator;
  const { name: browserName, version: browserVersion } = detectBrowser();
  
  // Detekce typu zařízení
  let type: 'android' | 'ios' | 'desktop' | 'unknown' = 'unknown';
  let manufacturer;
  let model;
  
  if (/Android/.test(userAgent)) {
    type = 'android';
    
    // Pokus o extrakci výrobce a modelu
    const match = userAgent.match(/Android [0-9\.]+; ([^;]+); ([^;)]+)/);
    if (match) {
      manufacturer = match[1];
      model = match[2];
    }
    
    // Speciální případy pro Samsung
    if (/SM-|SAMSUNG/.test(userAgent)) {
      manufacturer = 'Samsung';
    }
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    type = 'ios';
    manufacturer = 'Apple';
    
    if (/iPhone/.test(userAgent)) {
      model = 'iPhone';
    } else if (/iPad/.test(userAgent)) {
      model = 'iPad';
    } else if (/iPod/.test(userAgent)) {
      model = 'iPod';
    }
  } else if (!(/Android|iPhone|iPad|iPod|Mobile|Tablet/.test(userAgent))) {
    type = 'desktop';
  }
  
  // Detekce stáří zařízení
  let isOldDevice = false;
  
  if (type === 'android') {
    // Android 6.0 byl vydán v roce 2015
    isOldDevice = /Android [2-5]\./.test(userAgent);
  } else if (type === 'ios') {
    // iOS 12 byl vydán v roce 2018
    isOldDevice = /OS [4-9]_|OS 1[0-1]_/.test(userAgent);
  }
  
  // Detekce dotykového displeje
  const hasTouchScreen = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 ||
                         // @ts-ignore
                         navigator.msMaxTouchPoints > 0;
  
  return {
    type,
    manufacturer,
    model,
    isLowPerformance: estimateLowPerformance(),
    isOldDevice,
    hasTouchScreen,
    browserName,
    browserVersion,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio
  };
}

/**
 * Aplikuje optimalizace na základě parametrů zařízení
 */
export function applyDeviceOptimizations(): void {
  if (typeof document === 'undefined') return;
  
  const deviceInfo = getDeviceInfo();
  const root = document.documentElement;
  
  // Přidání tříd podle typu zařízení
  root.classList.toggle('android-device', deviceInfo.type === 'android');
  root.classList.toggle('ios-device', deviceInfo.type === 'ios');
  root.classList.toggle('desktop-device', deviceInfo.type === 'desktop');
  
  // Optimalizace pro výkon
  root.classList.toggle('low-performance-device', deviceInfo.isLowPerformance);
  root.classList.toggle('old-device', deviceInfo.isOldDevice);
  
  // Samsung specifické optimalizace
  if (deviceInfo.manufacturer === 'Samsung') {
    root.classList.add('samsung-device');
  }
  
  // Přidání tříd pro dotyková zařízení
  root.classList.toggle('touch-device', deviceInfo.hasTouchScreen);
  
  // Uchovávání informací pro debugování
  // @ts-ignore
  window.__deviceInfo = deviceInfo;
}

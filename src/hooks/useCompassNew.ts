/**
 * Hook pro přístup k senzorům kompasu a orientace zařízení
 * 
 * Tento hook poskytuje přístup k údajům z magnetometru a senzorů orientace zařízení,
 * které jsou potřebné pro funkci kompasu. Podporuje různá zařízení a prohlížeče.
 * Zpracovává vyhlazování pohybu, kalibraci, a detekci přesnosti kompasu.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import useOrientation from './useOrientation';

// Typ pro přesnost kompasu
type CompassAccuracy = 'high' | 'medium' | 'low' | 'unreliable';

interface CompassData {
  heading: number | null;        // Směr v stupních (0-360, sever = 0/360)
  accuracy: CompassAccuracy;     // Přesnost kompasu
  isCalibrated: boolean;         // Zda je kompas kalibrovaný
  isDeviceMoving: boolean;       // Zda je zařízení v pohybu
  requestPermission: () => Promise<boolean>; // Funkce pro vyžádání oprávnění
}

/**
 * Hook pro přístup ke kompasovým údajům zařízení
 * 
 * @param smoothingFactor Faktor vyhlazení (0-1, kde 0 je bez vyhlazení, 1 je maximální vyhlazení)
 * @param updateInterval Interval aktualizace hodnot v ms
 * @returns CompassData objekt s údaji kompasu
 */
export default function useCompass(smoothingFactor: number = 0.3, updateInterval: number = 100): CompassData {
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<CompassAccuracy>('unreliable');
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [isDeviceMoving, setIsDeviceMoving] = useState<boolean>(false);
  
  // Získáme informace o orientaci zařízení
  const { isIOS, isAndroid } = useOrientation();
  
  // Reference pro přímý přístup v callback funkcích
  const headingRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const smoothingFactorRef = useRef<number>(smoothingFactor);
  const isListeningRef = useRef<boolean>(false);
  
  // Reference pro sledování pohybu zařízení
  const lastAccelRef = useRef<{x: number, y: number, z: number} | null>(null);
  const movementCounterRef = useRef<number>(0);
  const calibrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Definice funkce pro naslouchání senzorům
  const startListening = useCallback(() => {
    if (isListeningRef.current) return;
    
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < updateInterval) return;
      
      // Pro iOS používáme webkitCompassHeading
      // @ts-ignore - webkitCompassHeading není v TypeScript typech
      const compassHeading = event.webkitCompassHeading || 
        // Pro Android a jiné prohlížeče používáme alpha s korekcí
        (event.alpha !== null ? 360 - event.alpha : null);
      
      if (compassHeading !== null) {
        // Vyhlazení hodnot pro plynulý pohyb kompasu
        if (headingRef.current === null) {
          headingRef.current = compassHeading;
        } else {
          // Výpočet nejkratší cesty (přes 0 nebo 360 stupňů)
          let diff = compassHeading - headingRef.current;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          
          // Aplikace vyhlazení
          headingRef.current += diff * (1 - smoothingFactorRef.current);
          
          // Korekce pro rozsah 0-360
          if (headingRef.current < 0) headingRef.current += 360;
          if (headingRef.current >= 360) headingRef.current -= 360;
        }
        
        setHeading(headingRef.current);
        lastUpdateRef.current = now;
        
        // Určení přesnosti na základě polohy zařízení
        if (event.beta !== null && event.gamma !== null) {
          const flatness = Math.abs(event.gamma) + Math.abs(event.beta - 90);
          if (flatness < 10) {
            setAccuracy('high');
            setIsCalibrated(true);
          } else if (flatness < 25) {
            setAccuracy('medium');
            setIsCalibrated(true);
          } else {
            setAccuracy('low');
            setIsCalibrated(flatness < 45);
          }
          
          // Reset moving indicator pokud je zařízení relativně stabilní
          if (calibrationTimeoutRef.current) {
            clearTimeout(calibrationTimeoutRef.current);
          }
          calibrationTimeoutRef.current = setTimeout(() => {
            setIsDeviceMoving(false);
          }, 2000);
        }
      }
    };
    
    // Funkce pro detekci pohybu zařízení - pomůže při kalibraci
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const { accelerationIncludingGravity, acceleration } = event;
      
      // Zkusíme nejprve accelerationIncludingGravity (kompatibilní s většinou zařízení)
      if (accelerationIncludingGravity && 
          accelerationIncludingGravity.x !== null && 
          accelerationIncludingGravity.y !== null && 
          accelerationIncludingGravity.z !== null) {
        
        const currentAccel = {
          x: accelerationIncludingGravity.x,
          y: accelerationIncludingGravity.y,
          z: accelerationIncludingGravity.z
        };
        
        // Detekce významnějšího pohybu zařízení
        if (lastAccelRef.current) {
          const movement = 
            Math.abs(currentAccel.x - lastAccelRef.current.x) +
            Math.abs(currentAccel.y - lastAccelRef.current.y) +
            Math.abs(currentAccel.z - lastAccelRef.current.z);
          
          // Pokud je pohyb větší než hranice, zvýšíme čítač
          if (movement > 1.5) {
            movementCounterRef.current += 1;
            
            // Po několika detekcích pohybu nastavíme příznak pohybu
            if (movementCounterRef.current > 3) {
              setIsDeviceMoving(true);
              movementCounterRef.current = 0;
            }
          } else {
            // Postupné snižování čítače pokud se zařízení nehýbe
            if (movementCounterRef.current > 0) {
              movementCounterRef.current -= 0.5;
            }
          }
        }
        
        lastAccelRef.current = currentAccel;
      } 
      // Záložní řešení, pokud accelerationIncludingGravity není k dispozici
      else if (acceleration && 
               acceleration.x !== null && 
               acceleration.y !== null && 
               acceleration.z !== null) {
        const movement = Math.abs(acceleration.x) + 
                         Math.abs(acceleration.y) + 
                         Math.abs(acceleration.z);
        setIsDeviceMoving(movement > 1); // Práh pohybu
      }
    };
    
    // Přidání event listenerů s ohledem na specifika různých prohlížečů
    if (isIOS) {
      // Safari na iOS potřebuje true pro použití zachytávání ve fázi
      window.addEventListener('deviceorientation', handleDeviceOrientation, true);
      window.addEventListener('devicemotion', handleDeviceMotion, true);
    } else {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      window.addEventListener('devicemotion', handleDeviceMotion);
    }
    
    isListeningRef.current = true;
    
    // Funkce pro čištění
    return () => {
      if (isIOS) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
        window.removeEventListener('devicemotion', handleDeviceMotion, true);
      } else {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
      
      isListeningRef.current = false;
      
      // Vyčištění timeoutů
      if (calibrationTimeoutRef.current) {
        clearTimeout(calibrationTimeoutRef.current);
        calibrationTimeoutRef.current = null;
      }
    };
  }, [updateInterval, isIOS]);
  
  // Funkce pro vyžádání oprávnění pro přístup k senzorům
  const requestPermission = useCallback(async (): Promise<boolean> => {
    // V některých prohlížečích (iOS Safari) je potřeba explicitní povolení
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        const granted = permissionState === 'granted';
        
        if (granted && !isListeningRef.current) {
          startListening();
        }
        
        return granted;
      } catch (error) {
        console.error('Chyba při žádosti o povolení senzorů:', error);
        return false;
      }
    }
    
    // Pro většinu prohlížečů není potřeba explicitní povolení
    if (!isListeningRef.current) {
      startListening();
    }
    
    return true;
  }, [startListening]);
  
  // Efekt pro nastavení posluchačů
  useEffect(() => {
    // Aktualizace ref hodnoty
    smoothingFactorRef.current = smoothingFactor;
    
    // Automaticky zkusíme spustit posluchače, pokud nepotřebujeme explicitní povolení
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      const cleanup = startListening();
      return () => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      };
    }
    // Pro zařízení vyžadující povolení (iOS 13+), nezačínat poslouchat automaticky,
    // počkáme na explicitní requestPermission
  }, [smoothingFactor, startListening]);
  
  return {
    heading,
    accuracy,
    isCalibrated,
    isDeviceMoving,
    requestPermission
  };
}

import { useEffect, useState, useCallback, useRef } from 'react';

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  continuousTracking?: boolean;
  minDistance?: number; // minimální vzdálenost v metrech pro aktualizaci polohy
}

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null; // směr pohybu ve stupních (0-360)
  speed: number | null; // rychlost v m/s
  timestamp: number | null;
  error: string | null;
  loading: boolean;
}

const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000, // 10 sekund
  timeout: 15000, // 15 sekund
  continuousTracking: true,
  minDistance: 5, // 5 metrů
};

// Funkce pro výpočet vzdálenosti mezi dvěma body (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // poloměr Země v metrech
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    loading: true,
  });
  
  const watchIdRef = useRef<number | null>(null);
  
  // Použití useRef místo useState pro lastPosition, aby nezpůsoboval re-render
  const lastPositionRef = useRef<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });

  const handleSuccess = useCallback(
    (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const timestamp = position.timestamp;

      // Pokud je definována minimální vzdálenost, kontrolujeme, zda jsme se dostatečně posunuli
      if (
        mergedOptions.minDistance &&
        lastPositionRef.current.latitude !== null &&
        lastPositionRef.current.longitude !== null
      ) {
        const distance = calculateDistance(
          lastPositionRef.current.latitude,
          lastPositionRef.current.longitude,
          latitude,
          longitude
        );

        // Pokud je vzdálenost menší než minimální a nemáme null hodnoty, neaktualizujeme state
        if (distance < mergedOptions.minDistance && state.latitude !== null) {
          return;
        }
      }

      // Aktualizace lastPosition pomocí ref místo setState
      lastPositionRef.current = { latitude, longitude };
      
      setState({
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        timestamp,
        loading: false,
        error: null,
      });
    },
    [mergedOptions.minDistance] // Odstranili jsme lastPosition a state.latitude ze závislostí
  );

  const handleError = useCallback((error: GeolocationPositionError) => {
    const errorMessages: { [key: number]: string } = {
      1: 'Přístup k poloze byl odmítnut. Povolte prosím přístup k poloze ve vašem prohlížeči.',
      2: 'Poloha není dostupná. Ujistěte se, že máte zapnuté polohové služby.',
      3: 'Vypršel časový limit pro získání polohy. Zkuste to prosím znovu.'
    };

    setState(prev => ({
      ...prev,
      error: errorMessages[error.code] || error.message,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState(prev => ({
        ...prev,
        error: 'Váš prohlížeč nepodporuje geolokaci.',
        loading: false,
      }));
      return;
    }

    const geolocationOptions = {
      enableHighAccuracy: mergedOptions.enableHighAccuracy,
      maximumAge: mergedOptions.maximumAge,
      timeout: mergedOptions.timeout,
    };

    // Nejprve získáme aktuální polohu
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    );

    // Pokud je požadováno průběžné sledování, nastavíme watchPosition
    if (mergedOptions.continuousTracking) {
      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geolocationOptions
      );
      watchIdRef.current = id;
    }

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [handleSuccess, handleError, mergedOptions.continuousTracking, mergedOptions.enableHighAccuracy, mergedOptions.maximumAge, mergedOptions.timeout]); // Odstranili jsme watchId ze závislostí a použili jednotlivé nastavení

  return state;
};

// Export jako výchozí i pojmenovaný, aby byla zachována zpětná kompatibilita
export default useGeolocation;
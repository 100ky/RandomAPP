/**
 * Nástroje pro omezení přiblížení mapy, aby se zabránilo jejímu zmizení
 * při přílišném přiblížení.
 */
import { Map as MapLibreMap } from 'maplibre-gl';

// Konstanty pro omezení přiblížení mapy
export const MIN_ZOOM = 5;
export const MAX_ZOOM = 18; // Nižší než maxzoom vrstvy (19), aby se zabránilo mizení mapy

/**
 * Omezí hodnotu zoomu na bezpečný rozsah
 * @param value Aktuální hodnota zoomu
 * @returns Bezpečná hodnota zoomu v rozmezí MIN_ZOOM až MAX_ZOOM
 */
export const constrainZoom = (value: number): number => {
  if (value < MIN_ZOOM) return MIN_ZOOM;
  if (value > MAX_ZOOM) return MAX_ZOOM;
  return value;
};

/**
 * Přidá omezení zoomu a události pro kontrolu zoomu k mapě
 * @param map Instance MapLibre mapy
 */
export const setupZoomConstraints = (map: MapLibreMap): void => {
  // Nastavit maximální a minimální zoom
  map.setMaxZoom(MAX_ZOOM);
  map.setMinZoom(MIN_ZOOM);

  // Přidat handler pro kontrolu zoomu při každé změně
  map.on('zoom', () => {
    const currentZoom = map.getZoom();
    const constrainedZoom = constrainZoom(currentZoom);
    
    // Pokud je aktuální zoom mimo povolený rozsah, opravit jej
    if (currentZoom !== constrainedZoom) {
      map.setZoom(constrainedZoom);
    }
  });
  
  // Přidat handler pro kontrolu zoomu po dokončení zoomování
  map.on('zoomend', () => {
    const currentZoom = map.getZoom();
    const constrainedZoom = constrainZoom(currentZoom);
    
    // Pokud je aktuální zoom mimo povolený rozsah, opravit jej
    if (currentZoom !== constrainedZoom) {
      map.setZoom(constrainedZoom);
    }
  });
};

/**
 * Plynule změní úroveň přiblížení mapy s animací
 * Zabraňuje trhavému pohybu při změně zoomu
 * 
 * @param map Instance MapLibre mapy
 * @param targetZoom Cílová úroveň přiblížení
 * @param duration Délka animace v ms (výchozí: 300ms)
 */
export const smoothZoom = (map: MapLibreMap, targetZoom: number, duration = 300): void => {
  const startZoom = map.getZoom();
  const startTime = Date.now();
  
  // Bezpečnostní kontrola cílového zoomu
  const safeTargetZoom = constrainZoom(targetZoom);
  
  // Pokud je aktuální zoom již na cílové hodnotě, nic nedělat
  if (Math.abs(startZoom - safeTargetZoom) < 0.01) return;
  
  const animate = () => {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Easing funkce - pomalejší ke konci pro plynulejší zastavení
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const easedProgress = easeOutCubic(progress);
    
    // Výpočet nového zoomu
    const newZoom = startZoom + (safeTargetZoom - startZoom) * easedProgress;
    
    // Nastavení nového zoomu
    map.setZoom(newZoom);
    
    // Pokud animace ještě neskončila, pokračovat
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
};

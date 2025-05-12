import React, { useEffect } from 'react';
import { SoundType, playSound } from '../utils/SoundManager';
import * as maplibre from 'maplibre-gl';

// Vlastnosti markeru uživatele
interface UserMarkerOptions {
  map: maplibre.Map;
  position: [number, number];
  accuracy?: number | null;
  heading?: number | null; 
  isGameActive?: boolean;
  avatarId?: string | null;
}

/**
 * Vytvoří a aktualizuje marker uživatele na mapě
 * 
 * @param options Nastavení markeru uživatele
 * @returns Instance vytvořeného markeru nebo null
 */
export function createUserMarker(options: UserMarkerOptions): maplibre.Marker {
  const {
    map,
    position,
    accuracy = null,
    heading = null,
    isGameActive = false,
    avatarId = 'default'
  } = options;

  // Vytvořit hlavní kontejner pro marker
  const el = document.createElement('div');
  el.className = 'user-marker-container';

  // Vytvořit strukturu markeru s různými vrstvami pro efekty
  el.innerHTML = `
    <div class="accuracy-circle"></div>
    <div class="user-marker ${isGameActive ? 'game-active' : ''}">
      <div class="direction-indicator"></div>
      <div class="avatar ${avatarId || 'default'}">
        <div class="pulse-effect"></div>
      </div>
      <div class="shadow"></div>
    </div>
  `;

  // Aktualizovat velikost kruhu přesnosti, pokud máme informaci o přesnosti
  if (accuracy !== null) {
    const accuracyCircle = el.querySelector('.accuracy-circle') as HTMLElement;
    if (accuracyCircle) {
      const scaleFactor = Math.max(5, Math.min(50, accuracy / 2));
      accuracyCircle.style.width = `${scaleFactor}px`;
      accuracyCircle.style.height = `${scaleFactor}px`;
      
      // Změnit barvu podle přesnosti
      if (accuracy < 10) {
        accuracyCircle.style.backgroundColor = 'rgba(82, 196, 26, 0.2)'; // zelená = přesné
      } else if (accuracy < 50) {
        accuracyCircle.style.backgroundColor = 'rgba(250, 173, 20, 0.2)'; // žlutá = střední přesnost
      } else {
        accuracyCircle.style.backgroundColor = 'rgba(245, 34, 45, 0.2)'; // červená = nepřesné
      }
    }
  }

  // Nastavit směrový indikátor, pokud máme informaci o směru pohybu
  if (heading !== null && !isNaN(heading)) {
    const directionIndicator = el.querySelector('.direction-indicator') as HTMLElement;
    if (directionIndicator) {
      directionIndicator.style.transform = `rotate(${heading}deg)`;
      directionIndicator.style.opacity = '1';
    }
  }

  // Vytvořit marker a přidat ho na mapu
  const marker = new maplibre.Marker({
    element: el,
    anchor: 'center',
    rotationAlignment: 'map'
  }).setLngLat(position);

  marker.addTo(map);
  
  return marker;
}

/**
 * Hook pro aktualizaci uživatelského markeru při změně polohy
 * 
 * @param map Instance mapy
 * @param markerRef Reference na marker
 * @param position Pozice [lng, lat]
 * @param options Další možnosti markeru
 */
export function useUserMarker(
  map: maplibre.Map | null,
  markerRef: React.MutableRefObject<maplibre.Marker | null>,
  position: [number, number] | null,
  options: {
    accuracy?: number | null;
    heading?: number | null;
    isGameActive?: boolean;
    avatarId?: string | null;
    onPositionChange?: (position: [number, number]) => void;
  }
) {
  const {
    accuracy = null,
    heading = null,
    isGameActive = false,
    avatarId = 'default',
    onPositionChange
  } = options;

  useEffect(() => {
    // Pokud nemáme mapu nebo pozici, nic nedělat
    if (!map || !position || position[0] === null || position[1] === null) {
      return;
    }

    // Volat callback s novou pozicí
    if (onPositionChange) {
      onPositionChange(position);
    }

    // Pokud už existuje marker, odstranit ho
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Vytvořit nový marker
    markerRef.current = createUserMarker({
      map,
      position,
      accuracy,
      heading,
      isGameActive,
      avatarId
    });

    // Vyčistit při unmount
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, position, accuracy, heading, isGameActive, avatarId, markerRef, onPositionChange]);
}

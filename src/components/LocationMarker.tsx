/**
 * Komponenta LocationMarker - Zobrazuje pozici uživatele na mapě
 * 
 * Tato vylepšená komponenta poskytuje bohatší vizuální zpětnou vazbu
 * o přesnosti polohy, směru pohybu a rychlosti pohybu uživatele.
 */
import React, { useRef, useEffect, useState } from 'react';
import { Marker } from 'maplibre-gl';
import { SoundType, playSound } from '../utils/SoundManager';
import styles from '../styles/LocationMarker.module.css';

// Vlastnosti komponenty
interface LocationMarkerProps {
  map: any; // instance mapy maplibre-gl
  position: { lat: number; lng: number };
  accuracy?: number;
  heading?: number;
  isGameActive?: boolean;
  avatarId?: string | null;
  onMarkerCreated?: (marker: Marker) => void;
}

// Komponenta pro zobrazení pozice uživatele
const LocationMarker: React.FC<LocationMarkerProps> = ({
  map,
  position,
  accuracy = 0,
  heading,
  isGameActive = false,
  avatarId = null,
  onMarkerCreated
}) => {
  const markerRef = useRef<Marker | null>(null);
  const elRef = useRef<HTMLDivElement | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const movementCounterRef = useRef<number>(0);
  const [isMoving, setIsMoving] = useState(false);
  
  // Kontrola pohybu
  useEffect(() => {
    if (lastPositionRef.current && position) {
      const lastPos = lastPositionRef.current;
      const distance = Math.sqrt(
        Math.pow(position.lat - lastPos.lat, 2) + 
        Math.pow(position.lng - lastPos.lng, 2)
      ) * 111000; // přibližný převod na metry
      
      if (distance > 3) { // pokud je pohyb větší než 3 metry
        setIsMoving(true);
        movementCounterRef.current += 1;
        
        // Po každých 5 pohybech přehrát zvuk kroku
        if (isGameActive && movementCounterRef.current % 5 === 0) {
          playSound(SoundType.STEP, { 
            volume: 0.15 + Math.random() * 0.1
          });
        }
        
        // Reset stavu pohybu po 1 sekundě nečinnosti
        setTimeout(() => setIsMoving(false), 1000);
      }
    }
    
    lastPositionRef.current = position;
  }, [position.lat, position.lng, isGameActive]);
  
  // Efekt pro vytvoření a aktualizaci markeru
  useEffect(() => {
    // Funkce pro vytvoření markeru
    const createMarker = () => {
      const el = document.createElement('div');
      el.className = styles.userMarkerContainer;
      elRef.current = el;
      
      // Vytvořit strukturu markeru s různými vrstvami pro efekty
      el.innerHTML = `
        <div class="${styles.accuracyCircle}"></div>
        <div class="${styles.userMarker} ${isGameActive ? styles.gameActive : ''}">
          <div class="${styles.directionIndicator}"></div>
          <div class="${styles.avatar} ${styles[avatarId || 'default']}">
            <div class="${styles.pulseEffect}"></div>
          </div>
          <div class="${styles.shadow}"></div>
        </div>
      `;
      
      const marker = new Marker({
        element: el,
        rotationAlignment: 'map'
      }).setLngLat([position.lng, position.lat]);
      
      // Přidat marker na mapu
      marker.addTo(map);
      markerRef.current = marker;
      
      // Zavolat callback, pokud existuje
      if (onMarkerCreated) {
        onMarkerCreated(marker);
      }
    };
    
    // Pokud marker ještě neexistuje, vytvořit ho
    if (!markerRef.current && map) {
      createMarker();
    }
    
    // Aktualizace pozice markeru
    if (markerRef.current) {
      markerRef.current.setLngLat([position.lng, position.lat]);
    }
    
    // Aktualizace vizuální reprezentace
    if (elRef.current) {
      const el = elRef.current;
      
      // Aktualizace velikosti kruhu přesnosti
      const accuracyCircle = el.querySelector(`.${styles.accuracyCircle}`) as HTMLElement;
      if (accuracyCircle) {
        // Převádíme přesnost (v metrech) na vizuální velikost
        // Používáme logaritmickou škálu pro lepší vizuální reprezentaci
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
        
        // Přidat třídu pro animaci při pohybu
        if (isMoving) {
          accuracyCircle.classList.add(styles.moving);
        } else {
          accuracyCircle.classList.remove(styles.moving);
        }
      }
      
      // Aktualizace indikátoru směru
      const directionIndicator = el.querySelector(`.${styles.directionIndicator}`) as HTMLElement;
      if (directionIndicator && typeof heading === 'number' && !isNaN(heading)) {
        // Nastavit rotaci podle směru pohybu (heading)
        directionIndicator.style.transform = `rotate(${heading}deg)`;
        directionIndicator.style.opacity = '1';
      } else if (directionIndicator) {
        directionIndicator.style.opacity = '0';
      }
      
      // Nastavení stavu aktivity
      const userMarker = el.querySelector(`.${styles.userMarker}`) as HTMLElement;
      if (userMarker) {
        if (isGameActive) {
          userMarker.classList.add(styles.gameActive);
        } else {
          userMarker.classList.remove(styles.gameActive);
        }
        
        // Přidat třídu pro animaci pohybu
        if (isMoving) {
          userMarker.classList.add(styles.moving);
        } else {
          userMarker.classList.remove(styles.moving);
        }
      }
      
      // Avatarové třídy
      const avatar = el.querySelector(`.${styles.avatar}`) as HTMLElement;
      if (avatar) {
        // Odstranit všechny třídy avatarů a nastavit základní třídu
        avatar.className = styles.avatar;
        
        // Přidat třídu pro aktuální avatar
        const avatarClass = styles[avatarId || 'default'];
        if (avatarClass) {
          avatar.classList.add(avatarClass);
        }
        
        // Přidat třídy pro stavy
        if (isMoving) {
          avatar.classList.add(styles.moving);
        }
        if (isGameActive) {
          avatar.classList.add(styles.gameActive);
        }
      }
    }
    
    // Cleanup při unmount
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, position, accuracy, heading, isGameActive, avatarId, isMoving, onMarkerCreated]);
  
  return null; // Komponenta nemá vlastní render, vše je v DOM
};

export default LocationMarker;
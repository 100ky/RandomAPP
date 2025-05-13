/**
 * Komponenta UserLocationMarker - Znázorňuje aktuální polohu uživatele na mapě
 * pomocí animované postavičky průzkumníka.
 */
import React, { useEffect, useState, useRef } from 'react';
import ExplorerMarker from './ExplorerMarker';
import { useGameStore } from '../store/gameStore';
import useGeolocation from '../hooks/useGeolocation';

/**
 * Props pro komponentu UserLocationMarker
 */
interface UserLocationMarkerProps {
  map?: maplibregl.Map;
  // Volitelný prop pro simulační režim
  simulationMode?: boolean;
  // Volitelné simulované souřadnice
  simulatedLocation?: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
  };
}

/**
 * Komponenta pro zobrazení polohy uživatele na mapě pomocí průzkumníka
 */
const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ 
  map, 
  simulationMode = false, 
  simulatedLocation 
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  // Reference poslední známé pozice pro výpočet pohybu
  const lastPositionRef = useRef<{lat: number, lng: number} | null>(null);
  
  // Použití hook pro geolokaci, který je součástí aplikace nebo simulované hodnoty
  const geoData = useGeolocation();
  
  // V simulačním režimu použijeme simulované hodnoty, jinak skutečnou geolokaci
  const latitude = simulationMode && simulatedLocation ? simulatedLocation.latitude : geoData.latitude;
  const longitude = simulationMode && simulatedLocation ? simulatedLocation.longitude : geoData.longitude;
  const heading = simulationMode && simulatedLocation ? simulatedLocation.heading : geoData.heading;
  const speed = simulationMode && simulatedLocation ? simulatedLocation.speed : geoData.speed;
  const accuracy = geoData.accuracy; // Accuracy používáme jen z geolokace
  
  // Získání herního stavu 
  const isGameRunning = useGameStore(state => state.isGameActive);
  
  // Efekt pro detekci pohybu na základě rychlosti a změny pozice
  useEffect(() => {
    // Pokud máme informaci o rychlosti, použijeme ji primárně pro určení pohybu
    if (speed !== null) {
      setIsMoving(speed > 0.5); // Pokud je rychlost větší než 0.5 m/s, považujeme to za pohyb
      return;
    }
    
    // Záložní řešení na základě změny pozice
    if (!latitude || !longitude) return;

    if (lastPositionRef.current) {
      const lastPos = lastPositionRef.current;
      
      // Výpočet přibližné vzdálenosti v metrech
      const distance = Math.sqrt(
        Math.pow(latitude - lastPos.lat, 2) + 
        Math.pow(longitude - lastPos.lng, 2)
      ) * 111000; // přibližný převod na metry
      
      // Pokud se uživatel posunul o více než 2 metry, považuje se to za pohyb
      if (distance > 2) {
        setIsMoving(true);
        
        // Nastavit timeout pro reset stavu pohybu, pokud se uživatel zastaví
        const timeout = setTimeout(() => {
          setIsMoving(false);
        }, 2000);
        
        return () => clearTimeout(timeout);
      } else {
        setIsMoving(false);
      }
    }
    
    // Uložit aktuální pozici pro příští porovnání
    lastPositionRef.current = { lat: latitude, lng: longitude };
  }, [latitude, longitude, speed]);
  
  // Efekt pro nastavení rotace postavičky podle směru pohybu
  useEffect(() => {
    if (heading !== null && heading !== undefined) {
      setRotation(heading);
    }
  }, [heading]);
  
  // Pokud nemáme mapu nebo lokaci, nic nerendrujeme
  if (!map || !latitude || !longitude) return null;
  
  // Použijeme projekci z maplibre pro převod GPS souřadnic na pixelové
  const point = map.project([longitude, latitude]);
  
  // Nyní můžeme rendrovat ExplorerMarker na správné pozici
  return (
    <div style={{ 
      position: 'absolute', 
      left: `${point.x}px`, 
      top: `${point.y}px`,
      transform: 'translate(-50%, -100%)', // Centrujeme marker na spodní stranu
      pointerEvents: 'none', // Aby marker nechytal kliknutí určená pro mapu
      zIndex: 500 // Ujistíme se, že je nad ostatními prvky
    }}>
      <ExplorerMarker
        isMoving={isMoving}
        rotation={rotation}
        pulse={true}
        size={44}
      />
    </div>
  );
};

export default UserLocationMarker;

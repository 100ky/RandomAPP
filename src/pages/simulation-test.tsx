import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useGameStore } from '../store/gameStore';
import Map from '../components/Map';
import AppMenu from '../components/AppMenu';
import { explorerLocations } from '../games/explorer/locations';
import styles from '../styles/SimulationTest.module.css';

// Simulační rozhraní pro testování geolokace
const SimulationTest: React.FC = () => {
  // Základní souřadnice centra Vysokého Mýta
  const centerLatitude = 49.9533;
  const centerLongitude = 16.1617;
  
  // Stav pro aktuální simulované souřadnice
  const [simulatedLocation, setSimulatedLocation] = useState({
    latitude: centerLatitude,
    longitude: centerLongitude,
    heading: 0,
    speed: 0,
  });

  // Stav pro zobrazení detailu lokace
  const [activeLocation, setActiveLocation] = useState<typeof explorerLocations[0] | null>(null);
  
  // Přístup ke gameStore pro sledování stavu hry
  const { playerProgress, startGame, visitLocation, solvePuzzle } = useGameStore();
  const isGameActive = useGameStore(state => state.isGameActive);
  // Funkce pro simulaci pohybu k vybrané lokaci
  const moveToLocation = useCallback((location: typeof explorerLocations[0]) => {
    console.log(`Přesouvám na lokaci: ${location.name}, souřadnice: ${location.coordinates.lat}, ${location.coordinates.lng}`);
    
    // Uložíme cílové souřadnice - budeme je používat opakovaně pro přesný výpočet aktuálního směru
    const targetLat = location.coordinates.lat;
    const targetLng = location.coordinates.lng;
    
    // Vypočítat počáteční směr k cíli (heading)
    const initialDeltaX = targetLng - simulatedLocation.longitude;
    const initialDeltaY = targetLat - simulatedLocation.latitude;
    const initialHeading = Math.atan2(initialDeltaY, initialDeltaX) * (180 / Math.PI);
    
    // Nastavit simulovanou rychlost pohybu
    setSimulatedLocation(prev => ({
      ...prev,
      heading: initialHeading,
      speed: 1.5 // m/s, přibližně rychlost chůze
    }));

    // Simulujeme postupný pohyb k lokaci
    const intervalId = setInterval(() => {
      setSimulatedLocation(prev => {
        // Přepočítat aktuální směr v každém kroku pro přesnou navigaci
        const deltaX = targetLng - prev.longitude;
        const deltaY = targetLat - prev.latitude;
        const currentHeading = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        const step = 0.00003; // Krok pohybu na mapě
        const newLng = prev.longitude + step * Math.cos(currentHeading * (Math.PI / 180));
        const newLat = prev.latitude + step * Math.sin(currentHeading * (Math.PI / 180));
        
        // Kontrola, jestli jsme již dostatečně blízko k cíli
        const distance = Math.sqrt(
          Math.pow(targetLat - newLat, 2) + 
          Math.pow(targetLng - newLng, 2)
        );
          // Pokud jsme dosáhli cíle, zastavíme pohyb
        if (distance < 0.0001) {
          clearInterval(intervalId);
          setActiveLocation(location);
          // Označíme lokaci jako navštívenou ve stavu hry
          visitLocation(location.id);
          console.log(`Dosažena lokace: ${location.name}`);
          return {
            latitude: targetLat,
            longitude: targetLng,
            heading: currentHeading,
            speed: 0
          };
        }
          // Pokračujeme v pohybu s aktualizací směru
        return {
          latitude: newLat,
          longitude: newLng,
          heading: currentHeading, // Použijeme aktuální přepočítaný směr
          speed: prev.speed
        };
      });
    }, 100);
    
    return () => clearInterval(intervalId);
  }, [simulatedLocation]);

  // Funkce pro restart simulace
  const resetSimulation = () => {
    setSimulatedLocation({
      latitude: centerLatitude,
      longitude: centerLongitude,
      heading: 0,
      speed: 0
    });
    setActiveLocation(null);
  };
  
  // Funkce pro simulaci řešení hádanky
  const simulateSolvePuzzle = (location: typeof explorerLocations[0]) => {
    if (location.puzzle) {
      solvePuzzle(location.puzzle.id);
      alert(`Hádanka vyřešena: ${location.puzzle.title}`);
    }
  };
  
  // Přepsání geolokačního API pro simulaci
  useEffect(() => {
    // Vytvořit mock navigátoru.geolocation
    const originalGeolocation = navigator.geolocation;
    
    // Náhrada getCurrentPosition a watchPosition metod
    const mockGeolocation = {
      getCurrentPosition: (successCallback: PositionCallback) => {
        successCallback({
          coords: {
            latitude: simulatedLocation.latitude,
            longitude: simulatedLocation.longitude,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: simulatedLocation.heading,
            speed: simulatedLocation.speed
          },
          timestamp: Date.now()
        });
      },
      watchPosition: (successCallback: PositionCallback) => {
        // Aktualizace každých 500ms
        const intervalId = setInterval(() => {
          successCallback({
            coords: {
              latitude: simulatedLocation.latitude,
              longitude: simulatedLocation.longitude,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: simulatedLocation.heading,
              speed: simulatedLocation.speed
            },
            timestamp: Date.now()
          });
        }, 500);
        
        return intervalId;
      },
      clearWatch: (id: number) => {
        clearInterval(id);
      }
    };
    
    // Nahradit originální geolokaci simulovanou
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true
    });
    
    // Obnovení originální geolokace při unmount
    return () => {
      Object.defineProperty(navigator, 'geolocation', {
        value: originalGeolocation,
        configurable: true
      });
    };
  }, [simulatedLocation]);
  
  // Automatické spuštění hry při načtení komponenty
  useEffect(() => {
    if (!isGameActive) {
      startGame();
    }
  }, [isGameActive, startGame]);
  return (
    <div className={`${styles.container} ${styles.simulationContainer}`}>
      <Head>
        <title>Testovací Simulace - Průzkumník Vysokého Mýta</title>
        <meta name="description" content="Testovací simulace pro hru Průzkumník Vysokého Mýta" />
      </Head>      {/* Avatar je umístěn mimo mapový kontejner pro správné zobrazení */}
      <div className={styles.appMenuWrapper}>
        <AppMenu selectedAvatarId="explorer" />
      </div>      <div className={styles.mapContainer}>
        <Map 
          selectedAvatarId="explorer" 
          animateToUserLocation={false}
          simulationProps={{
            enabled: true,
            location: simulatedLocation
          }}
        />
      </div>
      
      <div className={styles.controlPanel}>
        <h2>Simulace - Průzkumník Vysokého Mýta</h2>
        <div className={styles.stats}>
          <div>
            <strong>Kroky:</strong> {playerProgress.steps}
          </div>
          <div>
            <strong>Vzdálenost:</strong> {playerProgress.distanceMeters.toFixed(0)} m
          </div>
          <div>
            <strong>Navštívené lokace:</strong> {playerProgress.visitedLocations.length}/{explorerLocations.length}
          </div>
        </div>
        
        <div className={styles.locationSelection}>          <h3>Přesunout na lokaci:</h3>
          <div className={styles.locationList}>
            {explorerLocations.map(location => (
              <div key={location.id} className={styles.locationButtons}>
                <button 
                  onClick={() => moveToLocation(location)}
                  className={`${styles.locationButton} ${playerProgress.visitedLocations.includes(location.id) ? styles.visited : ''}`}
                >
                  {location.name}
                </button>                <button
                  onClick={() => {
                    // Okamžitý teleport na lokaci
                    console.log(`Teleport na lokaci: ${location.name}, souřadnice: ${location.coordinates.lat}, ${location.coordinates.lng}`);
                    setSimulatedLocation({
                      latitude: location.coordinates.lat,
                      longitude: location.coordinates.lng,
                      heading: 0,
                      speed: 0
                    });
                    setActiveLocation(location);
                    visitLocation(location.id);
                    console.log(`Navštívena lokace: ${location.name}`);
                  }}
                  className={styles.teleportButton}
                  title="Okamžitě teleportovat na tuto lokaci"
                >
                  →
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.actions}>
          <button onClick={resetSimulation} className={styles.resetButton}>
            Reset simulace
          </button>
          <Link href="/" passHref>
            <button className={styles.homeButton}>
              Zpět na hlavní stránku
            </button>
          </Link>
        </div>
        
        {activeLocation && (
          <div className={styles.locationDetail}>
            <h3>{activeLocation.name}</h3>
            <p>{activeLocation.shortDescription}</p>
            {activeLocation.puzzle && (
              <div className={styles.puzzleInfo}>
                <h4>Hádanka: {activeLocation.puzzle.title}</h4>
                <p>{activeLocation.puzzle.question}</p>
                <button 
                  onClick={() => simulateSolvePuzzle(activeLocation)}
                  className={styles.solveButton}
                >
                  Simulovat vyřešení hádanky
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className={styles.currentPosition}>
          <h3>Aktuální pozice</h3>
          <div>Šířka: {simulatedLocation.latitude.toFixed(6)}</div>
          <div>Délka: {simulatedLocation.longitude.toFixed(6)}</div>
          <div>Směr: {simulatedLocation.heading.toFixed(0)}°</div>
          <div>Rychlost: {simulatedLocation.speed.toFixed(1)} m/s</div>
        </div>
      </div>
    </div>
  );
};

export default SimulationTest;

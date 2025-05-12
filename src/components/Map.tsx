/**
 * Komponenta Map - Hlavní komponenta pro zobrazení interaktivní mapy a herní svět
 * 
 * Tato komponenta zobrazuje interaktivní mapu pomocí MapLibre GL, sleduje polohu uživatele,
 * zobrazuje body zájmu, umožňuje jejich objevování a poskytuje herní mechanismy jako počítání
 * kroků, sledování vzdálenosti a stažení offline mapy pro použití bez připojení k internetu.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibre from 'maplibre-gl';
import useGeolocation from '../hooks/useGeolocation';
import { pointsOfInterest } from '../data/cityBoundary';
import { avatars } from './AppMenu';
import { useGameStore } from '../store/gameStore';
import { createOfflineMapCache } from '../utils/mapHelpers';
import { getRequiredAttributions } from '../utils/attributions';
import styles from '../styles/Map.module.css';
import GameMenu from './GameMenu';
import GameControls from './GameControls';
import PuzzleModal from './PuzzleModal';
import { Puzzle } from '../types/game';
import { SoundType, playSound } from '../utils/SoundManager';
import { createUserMarker, useUserMarker } from '../utils/markerUtils';
import SoundControls from './SoundControls';

/**
 * Props pro komponentu Map
 */
interface MapProps {
    selectedAvatarId: string | null;        // ID vybraného avatara uživatelem
    animateToUserLocation?: boolean;        // Zda má mapa automaticky animovat k poloze uživatele
    onEndGame?: () => void;                 // Callback funkce volaná při ukončení hry
}

/**
 * Hlavní komponenta pro zobrazení a interakci s mapou
 */
const Map: React.FC<MapProps> = ({ selectedAvatarId, animateToUserLocation = false, onEndGame }) => {
    // Reference na DOM elementy a objekty mapy
    const mapContainerRef = useRef<HTMLDivElement | null>(null);    // Reference na DOM kontejner pro mapu
    const mapRef = useRef<maplibre.Map | null>(null);               // Reference na instanci mapy
    const userMarkerRef = useRef<maplibre.Marker | null>(null);     // Reference na marker uživatele
    const markersRef = useRef<maplibre.Marker[]>([]);               // Reference na markery bodů zájmu
    const animationStartedRef = useRef<boolean>(false);             // Reference pro sledování, zda byla animace spuštěna
    const lastPositionRef = useRef<{lat: number, lng: number} | null>(null);  // Reference na poslední pozici uživatele
    const stepCounterTimeoutRef = useRef<NodeJS.Timeout | null>(null);        // Reference na timeout pro počítání kroků
    
    // Připojení k Zustand storu pro správu herního stavu
    const { visitLocation, playerProgress, addSteps, addDistance, startGame, isGameActive, resetStats } = useGameStore();
    
    // Stav pro sledování, zda je hra spuštěna
    const [isGameRunning, setIsGameRunning] = useState(false);
    
    // Použití hooku pro geolokaci - sledování polohy uživatele
    const { 
        latitude, 
        longitude, 
        accuracy, 
        heading, 
        error: geolocationError,
        loading: geolocationLoading 
    } = useGeolocation({
        enableHighAccuracy: true,
        continuousTracking: true,
        minDistance: 5, // aktualizovat polohu jen když se uživatel posune alespoň o 5 metrů
    });
    
    // Stavy komponenty mapy
    const [mapLoaded, setMapLoaded] = useState(false);              // Byl načten mapový podklad
    const [offlineMode, setOfflineMode] = useState(false);          // Je aktivní offline režim
    const [offlineTilesStatus, setOfflineTilesStatus] = useState({  // Stav stahování offline dlaždic
        downloading: false,
        progress: 0,
        complete: false,
    });
    const [isGamePaused, setIsGamePaused] = useState(false);        // Je hra pozastavena
    const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null); // Aktuálně aktivní hádanka    // Stav pro skrytí chybové zprávy geolokace
    const [hideGeolocationError, setHideGeolocationError] = useState(false);
    
    /**
     * Funkce pro zavření chybové zprávy o poloze
     */
    const handleDismissGeolocationError = useCallback(() => {
        setHideGeolocationError(true);
    }, []);
      /**
     * Funkce nyní odstraněna - fullscreen funkcionalita již není potřeba
     */
    
    /**
     * Zahájí novou hru - inicializace herního stavu
     */
    const handleStartGame = useCallback(() => {
        // Přidat třídu pro animaci přechodu
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.classList.add('game-starting');
            
            // Efekt zvlnění mapy při startu hry
            if (mapRef.current) {
                const currentZoom = mapRef.current.getZoom();
                const currentCenter = mapRef.current.getCenter();
                
                // Plynulá animace přiblížení a oddálení pro efekt "bounce"
                mapRef.current.easeTo({
                    zoom: currentZoom + 0.5,
                    duration: 800,
                    easing: (t) => {
                        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    }
                });
                
                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.easeTo({
                            zoom: currentZoom,
                            duration: 600
                        });
                    }
                }, 850);
            }
            
            // Po animaci nastavit stav
            setTimeout(() => {
                startGame();
                resetStats(); // Reset statistik při novém startu
                setIsGameRunning(true);
                
                if (mapContainer) {
                    mapContainer.classList.remove('game-starting');
                    mapContainer.classList.add('game-active');
                }
            }, 600);
            
            // Přidat zvukový efekt při startu hry
            playSound(SoundType.GAME_START)
        } else {
            // Záložní řešení, pokud není k dispozici element kontejneru
            startGame();
            resetStats();
            setIsGameRunning(true);
        }
    }, [startGame, resetStats]);
    
    /**
     * Ukončí/zastaví aktuální hru
     */
    const handleStopGame = useCallback(() => {
        setIsGameRunning(false);
        if (onEndGame) {
            onEndGame();
        }
    }, [onEndGame]);
    
    /**
     * Pozastaví běžící hru
     */
    const handlePauseGame = useCallback(() => {
        setIsGamePaused(true);
    }, []);
    
    /**
     * Pokračuje v pozastavené hře
     */
    const handleResumeGame = useCallback(() => {
        setIsGamePaused(false);
    }, []);
    
    /**
     * Ukončí aktuální hru a spustí callback onEndGame
     */
    const handleEndGame = useCallback(() => {
        setIsGameRunning(false);
        if (onEndGame) {
            onEndGame();
        }
    }, [onEndGame]);
    
    // Detekce orientace zařízení
    const [isLandscape, setIsLandscape] = useState<boolean>(false);
    
    // Sledování změny orientace
    useEffect(() => {
        /**
         * Kontrola orientace zařízení a nastavení příslušného stavu
         */
        const checkOrientation = () => {
            setIsLandscape(window.innerWidth > window.innerHeight);
        };
        
        // Počáteční kontrola
        checkOrientation();
        
        // Přidat posluchač události pro změnu velikosti okna
        window.addEventListener('resize', checkOrientation);
        
        // Volitelně, sledování změny orientace pomocí API, pokud je podporováno
        try {
            if ('orientation' in screen && 'addEventListener' in screen.orientation) {
                screen.orientation.addEventListener('change', checkOrientation);
            } else if ('onorientationchange' in window) {
                window.addEventListener('orientationchange', checkOrientation);
            }
        } catch (error) {
            console.log('API orientace není podporováno:', error);
        }
        
        // Cleanup - odstranění posluchačů událostí
        return () => {
            window.removeEventListener('resize', checkOrientation);
            try {
                if ('orientation' in screen && 'removeEventListener' in screen.orientation) {
                    screen.orientation.removeEventListener('change', checkOrientation);
                } else if ('onorientationchange' in window) {
                    window.removeEventListener('orientationchange', checkOrientation);
                }
            } catch (error) {
                console.log('API orientace není podporováno:', error);
            }
        };
    }, []);
    
    // Aktualizace mapy při změně orientace zařízení
    useEffect(() => {
        if (mapRef.current && mapLoaded) {
            // Dát mapě čas na přizpůsobení se novým rozměrům
            setTimeout(() => {
                mapRef.current?.resize();
                
                // Pokud máme souřadnice uživatele, vycentrovat mapu
                if (latitude && longitude) {
                    mapRef.current.flyTo({
                        center: [longitude, latitude],
                        speed: 0.8,
                        essential: true
                    });
                }
                
                // Přeuspořádat UI prvky pro různé orientace
                adjustUIForOrientation(isLandscape);
            }, 200);
        }
    }, [isLandscape, mapLoaded, latitude, longitude]);

    /**
     * Upraví rozložení UI prvků podle orientace zařízení
     * @param landscape Zda je zařízení v landscape orientaci
     */
    const adjustUIForOrientation = useCallback((landscape: boolean) => {
        // Přizpůsobit rozložení UI prvků podle orientace
        const gameControls = document.querySelector('.game-controls');
        const gameMenu = document.querySelector('.game-menu');
        
        if (gameControls) {
            if (landscape) {
                gameControls.classList.add('landscape-controls');
            } else {
                gameControls.classList.remove('landscape-controls');
            }
        }
        
        if (gameMenu) {
            if (landscape) {
                gameMenu.classList.add('landscape-menu');
            } else {
                gameMenu.classList.remove('landscape-menu');
            }
        }
        
        // Aktualizovat pozici markerů a vyskakovacích oken
        if (markersRef.current.length > 0) {
            markersRef.current.forEach(marker => {
                const popup = marker.getPopup();
                if (popup && popup.isOpen()) {
                    popup.addClassName(landscape ? 'landscape-popup' : 'portrait-popup');
                }
            });
        }
    }, []);

    // Inicializovat nastavení UI pro aktuální orientaci při prvním načtení
    useEffect(() => {
        adjustUIForOrientation(isLandscape);
    }, [isLandscape, adjustUIForOrientation]);
    
    // Výchozí souřadnice pro Vysoké Mýto
    const defaultLatitude = 49.9532;
    const defaultLongitude = 16.1611;
    
    // Souřadnice a zoom pro celou Českou republiku
    const czechRepublicLatitude = 49.8175;
    const czechRepublicLongitude = 15.4730;
    const czechRepublicZoom = 7;

    // Najít vybraný avatar nebo použít první jako výchozí
    const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId) || avatars[0];

    /**
     * Formátuje vzdálenost v metrech na čitelný řetězec
     * @param meters Vzdálenost v metrech
     * @returns Formátovaný řetězec s jednotkami (m nebo km)
     */
    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        } else {
            return `${(meters / 1000).toFixed(2)} km`;
        }
    };

    /**
     * Aktualizuje počet kroků na základě uražené vzdálenosti
     * Používá jednoduchou heuristiku pro odhad počtu kroků ze vzdálenosti
     * @param distance Uražená vzdálenost v metrech
     */
    const updateStepsCount = useCallback((distance: number) => {
        // Přibližný počet kroků je vzdálenost v metrech děleno průměrnou délkou kroku (0.75m)
        const stepsEstimate = Math.round(distance / 0.75);
        if (stepsEstimate > 0) {
            addSteps(stepsEstimate);
        }
    }, [addSteps]);

    /**
     * Kontroluje, zda je uživatel blízko některé lokace a případně registruje návštěvu
     * @param userCoordinates Souřadnice uživatele ve formátu {lat, lng} nebo [lng, lat]
     */
    const checkProximityToLocations = useCallback((userCoordinates: {lat: number, lng: number} | [number, number]) => {
        // Zpracování souřadnic v závislosti na formátu dat
        const lat = Array.isArray(userCoordinates) ? userCoordinates[1] : userCoordinates.lat;
        const lng = Array.isArray(userCoordinates) ? userCoordinates[0] : userCoordinates.lng;
        
        if (!lng || !lat) return;
        
        pointsOfInterest.forEach(location => {
            const distanceToLocation = calculateDistance(
                lat, // latitude
                lng, // longitude
                location.coordinates[1], // point latitude
                location.coordinates[0]  // point longitude
            );
            
            // Pokud je uživatel v okruhu 50 metrů od lokace, zaznamenat návštěvu
            if (distanceToLocation <= 50) {
                // Zkontrolovat, zda uživatel již lokaci navštívil
                if (!playerProgress.visitedLocations.includes(location.id)) {
                    visitLocation(location.id);
                    
                    // Zobrazit oznámení o objevení nové lokace
                    showLocationDiscoveryNotification(location.name);
                    
                    // Počet objevených míst po přičtení aktuálního
                    const discoveredCount = playerProgress.visitedLocations.length + 1;
                    
                    // Pokud je to první objev místa, ukázat speciální achievement
                    if (discoveredCount === 1) {
                        import('../utils/achievementUtils').then(({ showAchievement }) => {
                            setTimeout(() => {
                                showAchievement({
                                    title: "První objevení!",
                                    description: `Objevil jsi své první místo: ${location.name}`,
                                    points: 100,
                                    autoClose: true,
                                    duration: 8000
                                });
                            }, 3000); // Počkat po notifikaci objevení
                        });
                    }
                    
                    // Pro každé 5. objevené místo ukázat speciální achievement
                    if (discoveredCount % 5 === 0) {
                        import('../utils/achievementUtils').then(({ showAchievement }) => {
                            setTimeout(() => {
                                showAchievement({
                                    title: "Objevitel!",
                                    description: `Už jsi objevil ${discoveredCount} míst`,
                                    points: 250,
                                    autoClose: true,
                                    duration: 8000
                                });
                            }, 3000);
                        });
                    }
                }
            }
        });
    }, [playerProgress.visitedLocations, visitLocation]);
    
    /**
     * Výpočet vzdálenosti mezi dvěma body pomocí Haversine formule
     * @param lat1 Zeměpisná šířka prvního bodu
     * @param lon1 Zeměpisná délka prvního bodu
     * @param lat2 Zeměpisná šířka druhého bodu
     * @param lon2 Zeměpisná délka druhého bodu
     * @returns Vzdálenost v metrech
     */
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
    
    /**
     * Efekt pro aktualizaci polohy uživatelského markeru na mapě
     */
    useEffect(() => {
        // Pokud není mapa načtená nebo nemáme polohu, nic nedělat
        if (!mapRef.current || !mapLoaded || latitude === null || longitude === null) {
            return;
        }
        
        // Souřadnice uživatele
        const userCoordinates: [number, number] = [longitude, latitude];
        
        // Pokud se mapa má automaticky přesunout k uživateli, udělat to
        if (animateToUserLocation && !animationStartedRef.current) {
            mapRef.current.flyTo({
                center: userCoordinates,
                zoom: 15,
                duration: 2000
            });
            animationStartedRef.current = true;
        }
        
        // Aktualizace vzdálenosti při pohybu uživatele
        if (lastPositionRef.current && isGameRunning) {
            const lastPos = lastPositionRef.current;
            const distance = Math.sqrt(
                Math.pow(latitude - lastPos.lat, 2) + 
                Math.pow(longitude - lastPos.lng, 2)
            ) * 111000; // přibližný převod na metry
            
            // Pokud je pohyb větší než 3 metry, přidat vzdálenost
            if (distance > 3) {
                addDistance(distance);
                updateStepsCount(distance);
                
                // Přehrát zvuk kroků s nižší pravděpodobností
                if (Math.random() < 0.3) {
                    playSound(SoundType.STEP, { volume: 0.15 + Math.random() * 0.1 });
                }
            }
        }
        
        // Uložit poslední pozici pro budoucí výpočty
        lastPositionRef.current = { lat: latitude, lng: longitude };

        // Pokud už existuje marker, odstranit ho
        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
            userMarkerRef.current = null;
        }

        // Vytvořit nový marker s naší utilitou
        if (mapRef.current) {
            userMarkerRef.current = createUserMarker({
                map: mapRef.current,
                position: userCoordinates,
                accuracy: accuracy || undefined,
                heading: heading || undefined,
                isGameActive: isGameRunning,
                avatarId: selectedAvatarId
            });
            
            // Kontrola, zda je uživatel v blízkosti některého z bodů zájmu
            if (isGameRunning) {
                checkProximityToLocations(userCoordinates);
            }
        }
        
        // Zde není potřeba vracet JSX element, protože marcery vytváříme imperativně
        return;
    }, [latitude, longitude, accuracy, heading, selectedAvatarId, mapLoaded, isGameRunning, 
        animateToUserLocation, addDistance, updateStepsCount, checkProximityToLocations]);
    
    /**
     * Zobrazí oznámení o objevení nové lokace s vylepšenou animací
     * @param locationName Název objevené lokace
     */
    const showLocationDiscoveryNotification = (locationName: string) => {
        // Vytvořit notifikační element
        const notification = document.createElement('div');
        notification.className = 'location-discovery-notification';
        
        // Vytvořit obsahový kontejner s animací
        const contentContainer = document.createElement('div');
        contentContainer.className = 'notification-content';
        
        // Přidat ikonu objevení
        const icon = document.createElement('div');
        icon.className = 'discovery-icon';
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        </svg>`;
        
        // Přidat text
        const text = document.createElement('div');
        text.className = 'discovery-text';
        text.innerHTML = `
            <div class="discovery-title">Nové místo!</div>
            <div class="discovery-name">${locationName}</div>
        `;
        
        // Sestavit notifikaci
        contentContainer.appendChild(icon);
        contentContainer.appendChild(text);
        notification.appendChild(contentContainer);
        
        // Přidat animovaný progress bar pro odpočet
        const progressBar = document.createElement('div');
        progressBar.className = 'notification-progress';
        notification.appendChild(progressBar);
        
        // Přidat do DOM
        document.body.appendChild(notification);
        
        // Přidat vstupní animaci
        setTimeout(() => {
            notification.classList.add('show');
            
            // Spustit progress bar
            setTimeout(() => {
                progressBar.classList.add('active');
            }, 100);
            
            // Odstranit po 5 sekundách
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 800);
            }, 5000);
        }, 10);

        // Přidat zvukový efekt při objevení
        playSound(SoundType.DISCOVER, { volume: 0.7 })
    };

    /**
     * Funkce pro přidání markerů lokací na mapu je nyní prázdná,
          * Funkce pro přidání markerů lokací na mapu je nyní prázdná, 
     * aby se odstranily body na mapě a jejich popisky
     */
    const addLocationMarkers = useCallback(() => {
        if (!mapRef.current) return;
        
        // Odstranit existující markery
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        
        // Již nebudeme přidávat žádné markery na mapu
        // Tím skryjeme všechny body na mapě s popisky
    }, [playerProgress.visitedLocations]);
    
    // Inicializace mapy při načtení komponenty
    useEffect(() => {
        // Inicializace mapy pouze pokud ještě nebyla vytvořena
        if (mapContainerRef.current && !mapRef.current) {
            // Určení počátečního středu a zoomu mapy
            let initialCenter;
            let initialZoom;
            
            if (animateToUserLocation) {
                // Pro animaci začínáme od zobrazení celé ČR
                initialCenter = [czechRepublicLongitude, czechRepublicLatitude];
                initialZoom = czechRepublicZoom;
            } else if (latitude && longitude && !geolocationError) {
                // Pokud je k dispozici poloha uživatele bez chyby, použijeme ji
                initialCenter = [longitude, latitude];
                initialZoom = 14;
            } else {
                // Pokud není geolokace dostupná nebo došlo k chybě, zobrazíme Vysoké Mýto
                initialCenter = [defaultLongitude, defaultLatitude];
                initialZoom = 15; // Vyšší zoom pro město
                console.log("Geolokace není dostupná nebo došlo k chybě, zobrazuji Vysoké Mýto");
            }
            
            // Kontrola, zda můžeme použít offline mapy (IndexedDB)
            const hasIndexedDB = typeof window !== 'undefined' && 'indexedDB' in window;
            
            // Zjistit, zda máme uložené dlaždice v cache
            const checkOfflineCache = async () => {
                if (hasIndexedDB) {
                    try {
                        const offlineDBRequest = indexedDB.open('map-tiles-cache', 1);
                        offlineDBRequest.onsuccess = (event) => {
                            const db = (event.target as IDBOpenDBRequest).result;
                            if (db.objectStoreNames.contains('tiles')) {
                                setOfflineMode(true);
                            }
                            db.close();
                        };
                    } catch (error) {
                        console.error('Chyba při kontrole offline cache:', error);
                    }
                }
            };
            
            checkOfflineCache();
            
            // Vytvořit transformační funkci pro offline cache mapových dlaždic
            const transformRequest = (url: string, resourceType?: any) => {
                if (resourceType === 'Tile' && offlineMode) {
                    // Kontrola, zda je dlaždice v cache a vrácení z cache, pokud existuje
                    return { url };
                }
                return { url };
            };
            
            // Vytvoření instance mapy
            mapRef.current = new maplibre.Map({
                container: mapContainerRef.current,
                style: {
                    version: 8,
                    sources: {
                        'osm-tiles': {
                            type: 'raster',
                            tiles: [
                                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                            ],
                            tileSize: 256,
                            // Použijeme naši atribuční funkci, která je požadována licencí ODbL
                            attribution: getRequiredAttributions()
                        }
                    },
                    layers: [
                        {
                            id: 'osm-tiles',
                            type: 'raster',
                            source: 'osm-tiles',
                            minzoom: 0,
                            maxzoom: 19
                        }
                    ]
                },
                center: initialCenter as [number, number],
                zoom: initialZoom,
                transformRequest
            });
            
            // Počkat na načtení mapy před přidáním vrstev
            mapRef.current.on('load', () => {
                if (!mapRef.current) return;
                
                // Přidat body zájmu jako markery
                addLocationMarkers();
                
                // Nastavit stav map jako načtený
                setMapLoaded(true);
                
                // Určení, kam přiblížit mapu po načtení
                if (latitude && longitude && !geolocationError) {
                    // Pokud je známa poloha uživatele a není chyba geolokace
                    if (animateToUserLocation && !animationStartedRef.current) {
                        // Pokud je požadována animace, použijeme plynulou animaci od ČR
                        setTimeout(() => {
                            startZoomAnimation();
                        }, 1000); // Malá prodleva před zahájením animace
                    } else {
                        // Jinak prostě přiblížíme k uživateli
                        mapRef.current.flyTo({
                            center: [longitude, latitude],
                            zoom: 16,
                            speed: 1.2,
                            curve: 1.4
                        });
                    }
                } else {
                    // Pokud není dostupná poloha uživatele nebo je chyba, přiblížíme na Vysoké Mýto
                    mapRef.current.flyTo({
                        center: [defaultLongitude, defaultLatitude],
                        zoom: 15,
                        speed: 1.2,
                        curve: 1.4
                    });
                    console.log("Po načtení mapy: Přibližuji na Vysoké Mýto, poloha uživatele není dostupná");
                }
            });
        }

        // Cleanup při odmontování komponenty
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [animateToUserLocation, latitude, longitude, geolocationError, addLocationMarkers]);
    
    // Efekt pro monitorování a reakci na chyby geolokace
    useEffect(() => {
        // Pokud mapa již byla načtena a objevila se chyba geolokace nebo pozice není k dispozici
        if (mapLoaded && mapRef.current && (geolocationError || (!latitude && !longitude))) {
            console.log('Geolokace není dostupná nebo nastala chyba, přibližuji na Vysoké Mýto');
            // Počkat chvilku před přesunutím, aby měl uživatel čas si všimnout chyby
            setTimeout(() => {
                centerOnVysokeMýto();
            }, 1500);
        }
    }, [mapLoaded, geolocationError, latitude, longitude]);
    
    /**
     * Spustí animaci přiblížení mapy od celkového pohledu na ČR k aktuální poloze uživatele
     */
    const startZoomAnimation = () => {
        if (!mapRef.current || animationStartedRef.current || !latitude || !longitude) return;
        
        animationStartedRef.current = true;
        
        // Začínáme od celé České republiky
        const totalAnimationTime = 5000; // 5 sekund celkem
        const startTime = Date.now();
        
        const animate = () => {
            if (!mapRef.current) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / totalAnimationTime, 1);
            
            // Kubická easing funkce pro plynulejší zpomalení na konci
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Interpolace mezi výchozím a cílovým zoomem
            const newZoom = czechRepublicZoom + (14 - czechRepublicZoom) * easeProgress;
            
            // Interpolace mezi výchozími a cílovými souřadnicemi - k aktuální poloze uživatele
            const newLng = czechRepublicLongitude + (longitude - czechRepublicLongitude) * easeProgress;
            const newLat = czechRepublicLatitude + (latitude - czechRepublicLatitude) * easeProgress;
            
            mapRef.current.jumpTo({
                center: [newLng, newLat],
                zoom: newZoom
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    };

    /**
     * Spustí stažení offline mapových dlaždic pro použití bez připojení
     */
    const handleDownloadOfflineTiles = async () => {
        if (!mapRef.current) return;
        
        setOfflineTilesStatus({
            downloading: true,
            progress: 0,
            complete: false
        });
        
        try {
            // Získat aktuální zobrazení mapy
            const bounds = mapRef.current.getBounds();
            const minZoom = 10; // Minimální zoom level pro offline mapy
            const maxZoom = 16; // Maximální zoom level pro offline mapy
            
            await createOfflineMapCache(
                bounds,
                minZoom,
                maxZoom,
                (progress) => {
                    setOfflineTilesStatus({
                        downloading: true,
                        progress,
                        complete: false
                    });
                }
            );
            
            setOfflineTilesStatus({
                downloading: false,
                progress: 100,
                complete: true
            });
            
            setOfflineMode(true);
            
            // Zobrazit oznámení o úspěšném stažení
            alert('Offline mapy byly úspěšně staženy! Nyní můžete používat mapu i bez připojení k internetu.');
        } catch (error) {
            console.error('Chyba při stahování offline map:', error);
            setOfflineTilesStatus({
                downloading: false,
                progress: 0,
                complete: false
            });
            
            // Zobrazit chybové hlášení
            alert('Došlo k chybě při stahování offline map. Zkuste to prosím znovu.');
        }
    };
    
    /**
     * Vycentruje mapu na aktuální polohu uživatele
     */
    const centerOnUser = () => {
        if (mapRef.current && latitude && longitude) {
            mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: 16,
                speed: 1.2,
                essential: true // Zajistí, že animace nebude přerušena
            });
        }
    };

    /**
     * Vycentruje mapu na Vysoké Mýto
     */
    const centerOnVysokeMýto = () => {
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [defaultLongitude, defaultLatitude],
                zoom: 15,
                speed: 1.2,
                essential: true
            });
        }
    };
    
    /**
     * Zavře aktivní hádanku
     */
    const handleClosePuzzle = () => {
        setActivePuzzle(null);
    };
    
    /**
     * Zpracuje úspěšné vyřešení hádanky
     */
    const handleSolvePuzzle = (puzzleId: string, points: number) => {
        // Zde lze implementovat další logiku po vyřešení hádanky
        console.log(`Hádanka ${puzzleId} vyřešena za ${points} bodů`);
    };
      return (
        <div className={styles.mapContainerWrapper} id="map-container">
            <div ref={mapContainerRef} className={styles.mapContainer} />
            
            {/* Herní menu pro ovládání hry */}
            <GameMenu 
                onPauseGame={handlePauseGame}
                onResumeGame={handleResumeGame}
                onEndGame={handleEndGame}
                downloadOfflineMaps={handleDownloadOfflineTiles}
                isOfflineMode={offlineMode}
                isDownloading={offlineTilesStatus.downloading}
                downloadProgress={offlineTilesStatus.progress}
                isPaused={isGamePaused}
                isGameRunning={isGameRunning}
            />
            
            {/* Ovládání zvuku */}
            <SoundControls />
              {/* Tlačítka pro ovládání hry (start/stop) */}
            <GameControls 
                onStart={handleStartGame}
                onStop={handleStopGame}
                isGameRunning={isGameRunning}
            />
            
            {/* Indikátor offline režimu */}
            {offlineMode && (
                <div className={styles.offlineIndicator}>
                    Offline režim aktivní
                </div>
            )}
            
            {/* Indikátor stahování offline map */}
            {offlineTilesStatus.downloading && (
                <div className={styles.downloadProgress}>
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFilled}
                            style={{ width: `${offlineTilesStatus.progress}%` }}
                        />
                    </div>
                    <div className={styles.progressText}>
                        Stahování map: {Math.round(offlineTilesStatus.progress)}%
                    </div>
                </div>
            )}
            
            {/* Indikátor pozastavení hry */}
            {isGamePaused && (
                <div className={styles.gamePausedIndicator}>
                    <div className={styles.gamePausedContent}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                        <p>Hra pozastavena</p>
                        <button onClick={handleResumeGame} className={styles.resumeButton}>Pokračovat</button>
                    </div>
                </div>
            )}
            
            {/* Modální okno s hádankou */}
            {activePuzzle && (
                <PuzzleModal
                    puzzle={activePuzzle}
                    onClose={handleClosePuzzle}
                    onSolve={handleSolvePuzzle}
                />
            )}
              
            {/* Chybová zpráva geolokace */}
            {geolocationError && !hideGeolocationError && (
                <div className={styles.geolocationError}>
                    <p>{geolocationError}</p>
                    <div className={styles.geolocationErrorButtons}>
                        <button onClick={centerOnVysokeMýto} className={styles.centerButton}>Přiblížit na Vysoké Mýto</button>
                        <button onClick={handleDismissGeolocationError}>Zavřít</button>
                    </div>
                </div>
            )}

            {/* Tlačítko pro přiblížení na Vysoké Mýto, viditelné jen když není aktivní geolokace */}
            {(!latitude || !longitude || geolocationError) && 
                <button 
                    className={styles.vysokemytoButton}
                    onClick={centerOnVysokeMýto}
                    title="Přiblížit na Vysoké Mýto"
                >                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                </button>
            }
            
            {/* Atribuce mapových podkladů - vyžadováno licencí ODbL */}
            <div className={styles.mapAttribution}>
                <div dangerouslySetInnerHTML={{ __html: getRequiredAttributions() }} />
            </div>
        </div>
    );
};

export default Map;

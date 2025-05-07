import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibre from 'maplibre-gl';
import useGeolocation from '../hooks/useGeolocation';
import { vysokeMytoGeoJSON, vysokeMytoCenterGeoJSON, pointsOfInterest } from '../data/cityBoundary';
import { avatars } from './AppMenu';
import { useGameStore } from '../store/gameStore';
import { createOfflineMapCache } from '../utils/mapHelpers';
import LocationMarker from './LocationMarker';
import { getRequiredAttributions } from '../utils/attributions';
import FullscreenToggle from './FullscreenToggle';

interface MapProps {
    selectedAvatarId: string | null;
    animateToUserLocation?: boolean;
}

const Map: React.FC<MapProps> = ({ selectedAvatarId, animateToUserLocation = false }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibre.Map | null>(null);
    const userMarkerRef = useRef<maplibre.Marker | null>(null);
    const markersRef = useRef<maplibre.Marker[]>([]);
    const animationStartedRef = useRef<boolean>(false);
    const lastPositionRef = useRef<{lat: number, lng: number} | null>(null);
    const stepCounterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Připojení k Zustand storu
    const { visitLocation, playerProgress, addSteps, addDistance } = useGameStore();
    
    // Použití vylepšeného hooku pro geolokaci
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
    const [mapLoaded, setMapLoaded] = useState(false);
    const [offlineMode, setOfflineMode] = useState(false);
    const [offlineTilesStatus, setOfflineTilesStatus] = useState({
        downloading: false,
        progress: 0,
        complete: false,
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Nový stav pro sledování režimu zobrazení
    const [isFullscreenMode, setIsFullscreenMode] = useState(false);
    
    // Přidání nového stavu pro skrytí chybové zprávy geolokace
    const [hideGeolocationError, setHideGeolocationError] = useState(false);
    
    // Funkce pro zavření chybové zprávy o poloze
    const handleDismissGeolocationError = useCallback(() => {
        setHideGeolocationError(true);
    }, []);
    
    // Funkce pro zpracování změny fullscreen režimu
    const handleFullscreenToggle = useCallback((isFullscreen: boolean) => {
        setIsFullscreenMode(isFullscreen);
        
        // Pokud je mapa již načtená, aktualizovat její velikost po změně režimu
        if (mapRef.current && mapLoaded) {
            // Krátká prodleva, aby se stihly aplikovat CSS změny
            setTimeout(() => {
                mapRef.current?.resize();
            }, 100);
        }
    }, [mapLoaded]);
    
    // Detekce orientace zařízení
    const [isLandscape, setIsLandscape] = useState<boolean>(false);
    
    // Sledování změny orientace
    useEffect(() => {
        const checkOrientation = () => {
            setIsLandscape(window.innerWidth > window.innerHeight);
        };
        
        // Počáteční kontrola
        checkOrientation();
        
        // Přidat posluchač události
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
        
        // Cleanup
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
    
    // Aktualizace mapy při změně orientace
    useEffect(() => {
        if (mapRef.current && mapLoaded) {
            // Dát mapě čas na přizpůsobení se novým rozměrům
            setTimeout(() => {
                mapRef.current?.resize();
            }, 200);
        }
    }, [isLandscape, mapLoaded]);
    
    // Výchozí souřadnice pro Vysoké Mýto
    const defaultLatitude = 49.9532;
    const defaultLongitude = 16.1611;
    
    // Souřadnice a zoom pro celou Českou republiku
    const czechRepublicLatitude = 49.8175;
    const czechRepublicLongitude = 15.4730;
    const czechRepublicZoom = 7;

    // Najít vybraný avatar nebo použít první jako výchozí
    const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId) || avatars[0];

    // Funkce pro formátování vzdálenosti
    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        } else {
            return `${(meters / 1000).toFixed(2)} km`;
        }
    };

    // Funkce pro aktualizaci počtu kroků - jednoduchá heuristika
    const updateStepsCount = useCallback((distance: number) => {
        // Přibližný počet kroků je vzdálenost v metrech děleno průměrnou délkou kroku (0.75m)
        const stepsEstimate = Math.round(distance / 0.75);
        if (stepsEstimate > 0) {
            addSteps(stepsEstimate);
        }
    }, [addSteps]);

    // Funkce pro kontrolu, zda je uživatel blízko některé lokace
    const checkProximityToLocations = useCallback((userCoordinates: [number, number]) => {
        if (!userCoordinates[0] || !userCoordinates[1]) return;
        
        pointsOfInterest.forEach(location => {
            const distanceToLocation = calculateDistance(
                userCoordinates[1], // latitude
                userCoordinates[0], // longitude
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
                }
            }
        });
    }, [playerProgress.visitedLocations, visitLocation]);
    
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
    
    // Funkce pro aktualizaci markeru uživatele podle aktuální polohy
    const updateUserMarker = useCallback(() => {
        if (!mapRef.current || !latitude || !longitude) return;

        // Souřadnice uživatele
        const userCoordinates: [number, number] = [longitude, latitude];

        // Výpočet vzdálenosti od poslední pozice
        if (lastPositionRef.current) {
            const distance = calculateDistance(
                latitude,
                longitude,
                lastPositionRef.current.lat,
                lastPositionRef.current.lng
            );
            
            if (distance > 5) { // jen pokud se pohnul o více než 5 metrů
                addDistance(distance); // přidat vzdálenost do stavu
                
                // Omezit aktualizaci kroků, aby nebyly příliš časté, ale jen když se uživatel hýbe
                if (stepCounterTimeoutRef.current) {
                    clearTimeout(stepCounterTimeoutRef.current);
                }
                
                stepCounterTimeoutRef.current = setTimeout(() => {
                    updateStepsCount(distance);
                }, 2000);
            }
        }
        
        // Uložit aktuální pozici
        lastPositionRef.current = { lat: latitude, lng: longitude };

        // Odstranit předchozí marker, pokud existuje
        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
        }

        // Vytvořit HTML element pro uživatelský marker s avatarem a přesností
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        
        // Přidat obrázek avatara
        const img = document.createElement('img');
        img.src = selectedAvatar.imageUrl;
        img.alt = selectedAvatar.name;
        el.appendChild(img);
        
        // Přidat indikátor přesnosti, pokud je k dispozici
        if (accuracy) {
            const accuracyCircle = document.createElement('div');
            accuracyCircle.className = 'accuracy-circle';
            // Nastavení velikosti kruhu podle přesnosti
            const circleSize = Math.min(Math.max(accuracy / 2, 20), 100); // Omezení velikosti kruhu
            accuracyCircle.style.width = `${circleSize}px`;
            accuracyCircle.style.height = `${circleSize}px`;
            el.appendChild(accuracyCircle);
        }
        
        if (heading && heading > 0) {
            // Přidat indikátor směru pohybu, pokud je k dispozici
            const headingIndicator = document.createElement('div');
            headingIndicator.className = 'heading-indicator';
            headingIndicator.style.transform = `rotate(${heading}deg)`;
            el.appendChild(headingIndicator);
        }

        // Vytvořit a přidat marker
        userMarkerRef.current = new maplibre.Marker({
            element: el,
            anchor: 'center',
            rotationAlignment: 'map'
        }).setLngLat(userCoordinates)
          .addTo(mapRef.current);
        
        // Kontrola, zda je uživatel v blízkosti některého z bodů zájmu
        checkProximityToLocations(userCoordinates);
    }, [latitude, longitude, accuracy, heading, selectedAvatar, addDistance, updateStepsCount, checkProximityToLocations]);
    
    // Zobrazení oznámení o objevení nové lokace
    const showLocationDiscoveryNotification = (locationName: string) => {
        // Vytvořit notifikační element
        const notification = document.createElement('div');
        notification.className = 'location-discovery-notification';
        notification.textContent = `Objevili jste: ${locationName}`;
        
        // Přidat do DOM
        document.body.appendChild(notification);
        
        // Odstranit po 4 sekundách
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 4000);
    };

    // Inicializace mapy
    useEffect(() => {
        // Inicializace mapy při načtení komponenty
        if (mapContainerRef.current && !mapRef.current) {
            const initialCenter = animateToUserLocation 
                ? [czechRepublicLongitude, czechRepublicLatitude] 
                : [defaultLongitude, defaultLatitude];
                
            const initialZoom = animateToUserLocation 
                ? czechRepublicZoom 
                : 14;
            
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
            const transformRequest = (url: string, resourceType: string) => {
                if (resourceType === 'Tile' && offlineMode) {
                    // Kontrola, zda je dlaždice v cache a vrácení z cache, pokud existuje
                    return { url };
                }
                return { url };
            };
            
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
            
            // Přidání kontrolních prvků pro zoom a navigaci
            mapRef.current.addControl(new maplibre.NavigationControl());
            
            // Přidání tlačítka pro stažení offline map
            const offlineControl = document.createElement('div');
            offlineControl.className = 'maplibregl-ctrl maplibregl-ctrl-group';
            offlineControl.innerHTML = `
                <button type="button" title="Stáhnout offline mapy" aria-label="Stáhnout offline mapy">
                    <span class="maplibregl-ctrl-icon">📥</span>
                </button>
            `;
            offlineControl.addEventListener('click', () => handleDownloadOfflineTiles());
            mapRef.current.getContainer().querySelector('.maplibregl-control-container')?.appendChild(offlineControl);

            // Počkat na načtení mapy před přidáním vrstev
            mapRef.current.on('load', () => {
                if (!mapRef.current) return;
                
                // Přidat zdroj dat pro hranice města
                mapRef.current.addSource('vysokemyto-boundary', {
                    'type': 'geojson',
                    'data': vysokeMytoGeoJSON
                });
                
                // Přidat vrstvu výplně s průhledností
                mapRef.current.addLayer({
                    'id': 'vysokemyto-fill',
                    'type': 'fill',
                    'source': 'vysokemyto-boundary',
                    'paint': {
                        'fill-color': '#3FB1CE',
                        'fill-opacity': 0.2
                    }
                });
                
                // Přidat vrstvu ohraničení
                mapRef.current.addLayer({
                    'id': 'vysokemyto-outline',
                    'type': 'line',
                    'source': 'vysokemyto-boundary',
                    'layout': {},
                    'paint': {
                        'line-color': '#3FB1CE',
                        'line-width': 3
                    }
                });
                
                // Přidat zdroj dat pro centrum města
                mapRef.current.addSource('vysokemyto-center', {
                    'type': 'geojson',
                    'data': vysokeMytoCenterGeoJSON
                });
                
                // Přidat vrstvu výplně s průhledností pro centrum
                mapRef.current.addLayer({
                    'id': 'vysokemyto-center-fill',
                    'type': 'fill',
                    'source': 'vysokemyto-center',
                    'paint': {
                        'fill-color': '#FF9900',
                        'fill-opacity': 0.3
                    }
                });
                
                // Přidat vrstvu ohraničení pro centrum
                mapRef.current.addLayer({
                    'id': 'vysokemyto-center-outline',
                    'type': 'line',
                    'source': 'vysokemyto-center',
                    'layout': {},
                    'paint': {
                        'line-color': '#FF9900',
                        'line-width': 2
                    }
                });
                
                // Přidat body zájmu jako markery
                addLocationMarkers();
                
                // Změnit kurzor na pointer při najetí na hranice města
                mapRef.current.on('mouseenter', 'vysokemyto-fill', () => {
                    if (!mapRef.current) return;
                    mapRef.current.getCanvas().style.cursor = 'pointer';
                });
                
                mapRef.current.on('mouseleave', 'vysokemyto-fill', () => {
                    if (!mapRef.current) return;
                    mapRef.current.getCanvas().style.cursor = '';
                });

                // Nastavit stav map jako načtený
                setMapLoaded(true);
                
                // Spustit animaci přiblížení, pokud je požadována
                if (animateToUserLocation && !animationStartedRef.current) {
                    setTimeout(() => {
                        startZoomAnimation();
                    }, 1000); // Malá prodleva před zahájením animace
                }
                
                // Animovat mapu k aktuální poloze uživatele, pokud je známa
                if (latitude && longitude) {
                    mapRef.current.flyTo({
                        center: [longitude, latitude],
                        zoom: 16,
                        speed: 1.2,
                        curve: 1.4
                    });
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
    }, [animateToUserLocation, latitude, longitude]);
    
    // Přidání markerů lokací
    const addLocationMarkers = useCallback(() => {
        if (!mapRef.current) return;
        
        // Odstranit existující markery
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        
        // Přidat nové markery
        pointsOfInterest.forEach(point => {
            // Zjistit, zda uživatel již lokaci navštívil
            const isVisited = playerProgress.visitedLocations.includes(point.id);
            
            // Přidat marker pomocí komponenty LocationMarker
            const locationMarkerEl = document.createElement('div');
            locationMarkerEl.style.width = '0';
            locationMarkerEl.style.height = '0';
            
            // Vytvořit ReactDOM element pro marker
            const marker = new maplibre.Marker(locationMarkerEl)
                .setLngLat(point.coordinates)
                .addTo(mapRef.current!);
            
            // Přidat popup
            const popup = new maplibre.Popup({ offset: 25, closeButton: false })
                .setHTML(`
                    <h3>${point.name}</h3>
                    <p>${point.description}</p>
                    ${isVisited ? '<span class="visited-badge">Navštíveno</span>' : ''}
                `);
            
            marker.setPopup(popup);
            
            // Uložit marker pro pozdější odstranění
            markersRef.current.push(marker);
            
            // Renderovat React komponentu jako marker
            const el = document.createElement('div');
            el.className = 'location-marker';
            el.style.backgroundColor = isVisited ? '#4CAF50' : '#FF4136';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
            el.style.position = 'absolute';
            el.style.top = '-10px';
            el.style.left = '-10px';
            
            if (isVisited) {
                // Přidat ikonu checkmark pro navštívené lokace
                const checkmark = document.createElement('div');
                checkmark.innerHTML = '✓';
                checkmark.style.color = 'white';
                checkmark.style.position = 'absolute';
                checkmark.style.top = '0';
                checkmark.style.left = '0';
                checkmark.style.right = '0';
                checkmark.style.bottom = '0';
                checkmark.style.display = 'flex';
                checkmark.style.alignItems = 'center';
                checkmark.style.justifyContent = 'center';
                checkmark.style.fontSize = '12px';
                el.appendChild(checkmark);
            }
            
            locationMarkerEl.appendChild(el);
        });
    }, [playerProgress.visitedLocations]);
    
    // Funkce pro spuštění animovaného přiblížení k uživateli
    const startZoomAnimation = () => {
        if (!mapRef.current || animationStartedRef.current) return;
        
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
            
            // Interpolace mezi výchozími a cílovými souřadnicemi
            const newLng = czechRepublicLongitude + (defaultLongitude - czechRepublicLongitude) * easeProgress;
            const newLat = czechRepublicLatitude + (defaultLatitude - czechRepublicLatitude) * easeProgress;
            
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

    // Stažení offline dlaždic mapy
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
    
    // Aktualizovat marker uživatele, když se změní jeho poloha
    useEffect(() => {
        if (mapLoaded && latitude && longitude) {
            updateUserMarker();
            
            // Animovat pohled mapy na uživatele, pokud se výrazně posunul
            if (userMarkerRef.current && mapRef.current) {
                const currentPosition = userMarkerRef.current.getLngLat();
                const distance = calculateDistance(
                    currentPosition.lat,
                    currentPosition.lng,
                    latitude,
                    longitude
                );
                
                // Pokud je vzdálenost větší než 100 metrů, animovat pohled mapy
                if (distance > 100) {
                    mapRef.current.flyTo({
                        center: [longitude, latitude],
                        speed: 0.8
                    });
                }
            }
        }
    }, [latitude, longitude, mapLoaded, updateUserMarker]);
    
    // Aktualizovat avatar uživatelského markeru, když se změní výběr
    useEffect(() => {
        if (mapLoaded && userMarkerRef.current) {
            updateUserMarker();
        }
    }, [selectedAvatarId, mapLoaded, updateUserMarker]);
    
    // Aktualizovat markery lokací když se změní navštívené lokace
    useEffect(() => {
        if (mapLoaded && mapRef.current) {
            addLocationMarkers();
        }
    }, [playerProgress.visitedLocations, mapLoaded, addLocationMarkers]);

    return (
        <div className={`map-container-wrapper ${isFullscreenMode ? 'map-fullscreen' : ''}`} id="map-container">
            <div ref={mapContainerRef} className="map-container" />
            
            {/* Přidat tlačítko pro fullscreen režim */}
            <FullscreenToggle 
                targetId="map-container" 
                type="map" 
                onToggle={handleFullscreenToggle}
            />
            
            {/* Offline status indikátor */}
            {offlineMode && (
                <div className="offline-indicator">
                    Offline režim aktivní
                </div>
            )}
            
            {/* Indikátor stahování map */}
            {offlineTilesStatus.downloading && (
                <div className="download-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-filled"
                            style={{ width: `${offlineTilesStatus.progress}%` }}
                        />
                    </div>
                    <div className="progress-text">
                        Stahování map: {Math.round(offlineTilesStatus.progress)}%
                    </div>
                </div>
            )}
            
            {/* Chybová zpráva geolokace */}
            {geolocationError && !hideGeolocationError && (
                <div className="geolocation-error">
                    <p>{geolocationError}</p>
                    <button onClick={handleDismissGeolocationError}>Zavřít</button>
                </div>
            )}
            
            {/* Atribuce mapových podkladů - vyžadováno licencí ODbL */}
            <div className="map-attribution">
                <div dangerouslySetInnerHTML={{ __html: getRequiredAttributions() }} />
            </div>
        </div>
    );
};

export default Map;

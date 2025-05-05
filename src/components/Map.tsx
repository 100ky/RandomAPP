import React, { useEffect, useRef } from 'react';
import maplibre from 'maplibre-gl';
import useGeolocation from '../hooks/useGeolocation';
import { vysokeMytoGeoJSON, vysokeMytoCenterGeoJSON, pointsOfInterest } from '../data/cityBoundary';
import { avatars } from './AppMenu';

interface MapProps {
    selectedAvatarId: string | null;
    animateToUserLocation?: boolean;
}

const Map: React.FC<MapProps> = ({ selectedAvatarId, animateToUserLocation = false }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibre.Map | null>(null);
    const userMarkerRef = useRef<maplibre.Marker | null>(null);
    const animationStartedRef = useRef<boolean>(false);
    
    // Výchozí souřadnice pro Vysoké Mýto
    const defaultLatitude = 49.9532;
    const defaultLongitude = 16.1611;
    
    // Souřadnice a zoom pro celou Českou republiku
    const czechRepublicLatitude = 49.8175;
    const czechRepublicLongitude = 15.4730;
    const czechRepublicZoom = 7;

    // Najít vybraný avatar nebo použít první jako výchozí
    const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId) || avatars[0];

    useEffect(() => {
        // Inicializace mapy při načtení komponenty
        if (mapContainerRef.current && !mapRef.current) {
            const initialCenter = animateToUserLocation 
                ? [czechRepublicLongitude, czechRepublicLatitude] 
                : [defaultLongitude, defaultLatitude];
                
            const initialZoom = animateToUserLocation 
                ? czechRepublicZoom 
                : 14;
            
            mapRef.current = new maplibre.Map({
                container: mapContainerRef.current,
                // Použití OpenStreetMap stylu místo demotiles pro zobrazení detailnějších dat měst
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
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
            });
            
            // Přidání kontrolních prvků pro zoom a navigaci
            mapRef.current.addControl(new maplibre.NavigationControl());

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
                pointsOfInterest.forEach(point => {
                    // Vytvořit HTML element pro marker
                    const el = document.createElement('div');
                    el.className = 'location-marker';
                    el.style.backgroundColor = '#FF4136';
                    el.style.width = '15px';
                    el.style.height = '15px';
                    el.style.borderRadius = '50%';
                    el.style.border = '2px solid white';
                    el.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
                    
                    // Přidat popup s informacemi
                    const popup = new maplibre.Popup({ offset: 25 })
                        .setHTML(`<h3>${point.name}</h3><p>${point.description}</p>`);
                    
                    // Vytvořit a přidat marker
                    new maplibre.Marker(el)
                        .setLngLat(point.coordinates)
                        .setPopup(popup)
                        .addTo(mapRef.current!);
                });
                
                // Změnit kurzor na pointer při najetí na hranice města
                mapRef.current.on('mouseenter', 'vysokemyto-fill', () => {
                    if (!mapRef.current) return;
                    mapRef.current.getCanvas().style.cursor = 'pointer';
                });
                
                mapRef.current.on('mouseleave', 'vysokemyto-fill', () => {
                    if (!mapRef.current) return;
                    mapRef.current.getCanvas().style.cursor = '';
                });

                // Přidat marker uživatele s vybraným avatarem
                addUserLocationMarker([defaultLongitude, defaultLatitude], selectedAvatar);
                
                // Spustit animaci přiblížení, pokud je požadována
                if (animateToUserLocation && !animationStartedRef.current) {
                    setTimeout(() => {
                        startZoomAnimation();
                    }, 1000); // Malá prodleva před zahájením animace
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
    }, []);
    
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

    // Přidání uživatelského markeru s avatarem
    const addUserLocationMarker = (coordinates: [number, number], avatar: typeof avatars[0]) => {
        if (!mapRef.current) return;

        // Odstranit předchozí marker, pokud existuje
        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
        }

        // Vytvořit HTML element pro uživatelský marker s avatarem
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        
        // Přidat obrázek avatara
        const img = document.createElement('img');
        img.src = avatar.imageUrl;
        img.alt = avatar.name;
        el.appendChild(img);

        // Vytvořit a přidat marker
        userMarkerRef.current = new maplibre.Marker(el)
            .setLngLat(coordinates)
            .addTo(mapRef.current);
    };

    // Aktualizovat avatar uživatelského markeru, když se změní výběr
    useEffect(() => {
        if (mapRef.current && userMarkerRef.current) {
            const coordinates = userMarkerRef.current.getLngLat();
            addUserLocationMarker([coordinates.lng, coordinates.lat], selectedAvatar);
        }
    }, [selectedAvatarId]);

    return (
        <div ref={mapContainerRef} className="map-container" />
    );
};

export default Map;
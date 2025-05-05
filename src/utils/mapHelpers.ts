import { Map, Marker, Popup, LngLatBounds } from 'maplibre-gl';

export interface Location {
    name: string;
    description: string;
    longitude: number;
    latitude: number;
}

export const addMarkerToMap = (map: Map, location: Location) => {
    const marker = new Marker()
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new Popup().setHTML(`<h3>${location.name}</h3><p>${location.description}</p>`))
        .addTo(map);
    
    return marker;
};

export const fitMapToMarkers = (map: Map, markers: Location[]) => {
    const bounds = new LngLatBounds();
    
    markers.forEach(marker => {
        bounds.extend([marker.longitude, marker.latitude]);
    });
    
    map.fitBounds(bounds, { padding: 20 });
};
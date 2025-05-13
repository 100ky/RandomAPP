/**
 * Utilita pro clusterování bodů zájmu (POI) na mapě
 * Pomáhá udržet mapu přehlednou při zobrazení většího množství bodů
 */
import * as maplibre from 'maplibre-gl';
import { POILocation } from '../types/game';

interface ClusterOptions {
  radius: number;        // Velikost shluku v pixelech
  maxZoom: number;       // Maximální úroveň přiblížení, při které dochází ke shlukování
  minPoints: number;     // Minimální počet bodů pro vytvoření shluku
}

// Výchozí nastavení clusterování
const DEFAULT_CLUSTER_OPTIONS: ClusterOptions = {
  radius: 50,
  maxZoom: 15,  // Pod touto úrovní přiblížení se body shlukují
  minPoints: 2   // Shluk se vytvoří, pokud jsou alespoň 2 body blízko sebe
};

/**
 * Přidá clusterování bodů zájmu na mapu
 * 
 * @param map Instance MapLibre mapy
 * @param locations Body zájmu k zobrazení/clusterování
 * @param options Nastavení clusterování
 * @param clickCallback Callback funkce při kliknutí na bod/cluster
 */
export function addClustering(
  map: maplibre.Map, 
  locations: POILocation[],
  options: Partial<ClusterOptions> = {},
  clickCallback?: (location: POILocation) => void
): void {
  // Spojení výchozích a uživatelských nastavení
  const clusterOptions = { ...DEFAULT_CLUSTER_OPTIONS, ...options };

  // Vytvoření GeoJSON objektu z našich lokací
  const points = {
    type: 'FeatureCollection',
    features: locations.map(location => ({
      type: 'Feature',
      properties: {
        id: location.id,
        name: location.name,
        description: location.description,
        iconUrl: location.iconUrl || '',
        discovered: location.discovered || false,
        clusterPoints: 1 // Pomocná vlastnost pro počítání bodů ve shluku
      },
      geometry: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      }
    }))
  };

  // Přidání zdroje dat s nastavenou podporou clusterování
  map.addSource('poi-clusters', {
    type: 'geojson',
    data: points as any,
    cluster: true,
    clusterMaxZoom: clusterOptions.maxZoom,
    clusterRadius: clusterOptions.radius
  });

  // Přidání vrstvy pro zobrazení shluků
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'poi-clusters',
    filter: ['has', 'point_count'],
    paint: {
      // Velikost shluku podle počtu bodů
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,   // výchozí velikost
        5,    // pokud je bodů 5 a více
        25,
        10,   // pokud je bodů 10 a více
        30
      ],
      // Barva shluku podle počtu bodů
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#C3924A',  // Bronzová pro malé shluky
        5,
        '#B3B3B3',  // Stříbrná pro středně velké shluky
        10,
        '#FFD700'   // Zlatá pro velké shluky
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#FFFFFF'
    }
  });

  // Přidání vrstvy pro zobrazení počtu bodů ve shluku
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'poi-clusters',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Open Sans Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#FFFFFF'
    }
  });

  // Přidání vrstvy pro jednotlivé body, které nejsou ve shluku
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'poi-clusters',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['get', 'discovered'], // Podmínka: Je bod již objeven?
        '#52B788',             // Zelená pro objevené body
        '#9F2B68'              // Fialová pro neobjevené body
      ],
      'circle-radius': 8,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#FFFFFF'
    }
  });

  // Přidání události kliknutí na shluk
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    if (!features.length) return;
    
    const clusterId = features[0].properties?.cluster_id;
    
    // Získání souřadnic shluku pro přiblížení
    const coordinates = (features[0].geometry as any).coordinates;
    
    // Přiblížení na shluk
    map.flyTo({
      center: coordinates,
      zoom: map.getZoom() + 2,
      essential: true
    });
  });

  // Přidání události kliknutí na jednotlivý bod
  map.on('click', 'unclustered-point', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
    if (!features.length || !clickCallback) return;

    const props = features[0].properties;
    if (props) {
      // Najdeme odpovídající lokaci a zavoláme callback
      const location = locations.find(loc => loc.id === props.id);
      if (location) {
        clickCallback(location);
      }
    }
  });

  // Změna kurzoru při najetí na shluk nebo bod
  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  
  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = '';
  });

  map.on('mouseenter', 'unclustered-point', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  
  map.on('mouseleave', 'unclustered-point', () => {
    map.getCanvas().style.cursor = '';
  });
}

/**
 * Aktualizuje data ve zdroji clusterů
 * Použijte tuto funkci, když se změní stav objevených lokací
 * 
 * @param map Instance MapLibre mapy
 * @param locations Aktualizované body zájmu
 */
export function updateClusteringData(map: maplibre.Map, locations: POILocation[]): void {
  // Kontrola, zda zdroj existuje
  if (!map.getSource('poi-clusters')) {
    return;
  }

  // Vytvoření GeoJSON objektu z našich lokací
  const points = {
    type: 'FeatureCollection',
    features: locations.map(location => ({
      type: 'Feature',
      properties: {
        id: location.id,
        name: location.name,
        description: location.description,
        iconUrl: location.iconUrl || '',
        discovered: location.discovered || false,
        clusterPoints: 1
      },
      geometry: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      }
    }))
  };

  // Aktualizace dat ve zdroji
  (map.getSource('poi-clusters') as maplibre.GeoJSONSource).setData(points as any);
}

/**
 * Odebere vrstvy a zdroje clusterování z mapy
 * 
 * @param map Instance MapLibre mapy
 */
export function removeClusteringLayers(map: maplibre.Map): void {
  if (!map || !map.getStyle()) return;
  
  // Postupně odstraníme všechny přidané vrstvy a zdroje
  const layers = ['cluster-count', 'clusters', 'unclustered-point'];
  
  layers.forEach(layer => {
    if (map.getLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  if (map.getSource('poi-clusters')) {
    map.removeSource('poi-clusters');
  }
}

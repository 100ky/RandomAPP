import { Route } from '../types/social';

/**
 * Vytvoří GPX soubor z trasy
 * @param route Trasa k exportu
 * @returns GPX obsah jako string
 */
export const createGpxFromRoute = (route: Route): string => {
  const currentDate = new Date().toISOString();
  
  let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RandomAPP" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(route.name)}</name>
    <time>${currentDate}</time>
  </metadata>
  <trk>
    <name>${escapeXml(route.name)}</name>
    <trkseg>
`;

  // Přidat body trasy
  route.points.forEach(point => {
    gpxContent += `      <trkpt lat="${point.lat}" lon="${point.lng}">
        <ele>0</ele>
        <time>${new Date(point.timestamp).toISOString()}</time>
      </trkpt>
`;
  });

  // Uzavřít GPX dokument
  gpxContent += `    </trkseg>
  </trk>
</gpx>`;

  return gpxContent;
};

/**
 * Bezpečná escape funkce pro XML obsah
 */
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * Stáhne GPX soubor trasy
 * @param route Trasa k exportu
 */
export const downloadRouteAsGpx = (route: Route): void => {
  const gpxContent = createGpxFromRoute(route);
  
  // Vytvořit Blob pro stažení
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  
  // Vytvořit odkaz pro stažení a kliknout na něj
  const a = document.createElement('a');
  a.href = url;
  a.download = `${route.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Uvolnit URL objekt
  URL.revokeObjectURL(url);
};

/**
 * Vytvoří KML soubor z trasy
 * @param route Trasa k exportu
 * @returns KML obsah jako string
 */
export const createKmlFromRoute = (route: Route): string => {
  const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(route.name)}</name>
    <Style id="routeStyle">
      <LineStyle>
        <color>ff0000ff</color>
        <width>4</width>
      </LineStyle>
    </Style>
    <Placemark>
      <name>${escapeXml(route.name)}</name>
      <styleUrl>#routeStyle</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <coordinates>
          ${route.points.map(point => `${point.lng},${point.lat},0`).join('\n          ')}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

  return kmlContent;
};

/**
 * Stáhne KML soubor trasy
 * @param route Trasa k exportu
 */
export const downloadRouteAsKml = (route: Route): void => {
  const kmlContent = createKmlFromRoute(route);
  
  // Vytvořit Blob pro stažení
  const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  
  // Vytvořit odkaz pro stažení a kliknout na něj
  const a = document.createElement('a');
  a.href = url;
  a.download = `${route.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.kml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Uvolnit URL objekt
  URL.revokeObjectURL(url);
};

/**
 * Vytvoří geojson soubor z trasy
 */
export const createGeoJsonFromRoute = (route: Route): string => {
  const geoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: route.name,
          totalDistance: route.totalDistance,
          duration: route.duration
        },
        geometry: {
          type: "LineString",
          coordinates: route.points.map(point => [point.lng, point.lat])
        }
      }
    ]
  };
  
  return JSON.stringify(geoJson, null, 2);
};

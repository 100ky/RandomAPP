// Přesnější souřadnice ohraničení Vysokého Mýta jako mnohoúhelník
export const vysokeMytoCoordinates = [
  // Formát: [longitude, latitude]
  [16.1494, 49.9651], // sever
  [16.1567, 49.9678], // severovýchod
  [16.1652, 49.9671],
  [16.1724, 49.9650],
  [16.1786, 49.9622], // východ
  [16.1818, 49.9589],
  [16.1831, 49.9546],
  [16.1817, 49.9498],
  [16.1787, 49.9457], // jihovýchod
  [16.1742, 49.9429],
  [16.1682, 49.9409],
  [16.1612, 49.9402],
  [16.1551, 49.9405], // jih
  [16.1480, 49.9421],
  [16.1427, 49.9448],
  [16.1390, 49.9483],
  [16.1369, 49.9520], // jihozápad
  [16.1365, 49.9556],
  [16.1375, 49.9592],
  [16.1405, 49.9625],
  [16.1446, 49.9645], // severozápad
  [16.1494, 49.9651], // návrat na počáteční bod pro uzavření polygonu
];

// GeoJSON objekt pro hranice města
export const vysokeMytoGeoJSON = {
  type: 'Feature',
  properties: {
    name: 'Vysoké Mýto',
    description: 'Hranice města Vysoké Mýto',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [vysokeMytoCoordinates],
  },
};

// Přesnější hranice centra Vysokého Mýta (náměstí Přemysla Otakara II a okolí)
export const vysokeMytoCenterGeoJSON = {
  type: 'Feature',
  properties: {
    name: 'Centrum Vysokého Mýta',
    description: 'Náměstí Přemysla Otakara II a přilehlé ulice',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [16.1582, 49.9547], // severozápadní roh náměstí
      [16.1611, 49.9552],
      [16.1639, 49.9547], // severovýchodní roh náměstí
      [16.1644, 49.9536],
      [16.1639, 49.9526], // jihovýchodní roh náměstí
      [16.1611, 49.9521],
      [16.1582, 49.9526], // jihozápadní roh náměstí
      [16.1577, 49.9536],
      [16.1582, 49.9547], // zpět na začátek
    ]],
  },
};

// Významné body ve Vysokém Mýtě pro únikovou hru
export const pointsOfInterest = [
  {
    id: 'namesti',
    name: 'Náměstí Přemysla Otakara II',
    coordinates: [16.1611, 49.9536],
    description: 'Hlavní náměstí s renesanční radnicí a morovým sloupem',
  },
  {
    id: 'brana',
    name: 'Pražská brána',
    coordinates: [16.1577, 49.9536],
    description: 'Historická vstupní brána do města',
  },
  {
    id: 'kostel',
    name: 'Kostel sv. Vavřince',
    coordinates: [16.1622, 49.9542],
    description: 'Gotický kostel s vyhlídkovou věží',
  },
  {
    id: 'muzeum',
    name: 'Regionální muzeum',
    coordinates: [16.1595, 49.9525],
    description: 'Muzeum s expozicemi o historii města a regionu',
  },
  {
    id: 'park',
    name: 'Park Otmara Vaňorného',
    coordinates: [16.1640, 49.9510],
    description: 'Městský park s fontánou a odpočinkovými zónami',
  },
];
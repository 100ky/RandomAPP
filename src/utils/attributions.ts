/**
 * Licence a atribuce pro mapové podklady a data používané v aplikaci
 */

export const mapAttributions = {
  // OpenStreetMap atribuce - vyžadováno licencí ODbL
  openStreetMap: {
    html: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    text: '© OpenStreetMap contributors',
    url: 'https://www.openstreetmap.org/copyright',
    required: true
  },
  
  // MapLibre atribuce
  mapLibre: {
    html: 'Powered by <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre</a>',
    text: 'Powered by MapLibre',
    url: 'https://maplibre.org/',
    required: false
  },
  
  // Aplikační atribuce
  app: {
    html: '&copy; 2025 <strong>Vymýto - Úniková hra</strong>',
    text: '© 2025 Vymýto - Úniková hra',
    required: true
  }
};

/**
 * Vrátí HTML kód pro zobrazení povinných atribucí na mapě
 */
export const getRequiredAttributions = (): string => {
  const requiredAttributions = Object.values(mapAttributions)
    .filter(attr => attr.required)
    .map(attr => attr.html)
    .join(' | ');
    
  return requiredAttributions;
};

/**
 * Funkce pro generování plného textu licencí a atribucí pro zápatí aplikace
 */
export const getFullAttributionText = (): string => {
  return Object.values(mapAttributions)
    .map(attr => attr.text)
    .join(' | ');
};

/**
 * Atribuce pro použité ikony a obrázky
 */
export const mediaAttributions = {
  // Zde doplňte atribuce pro použité ikony, avatary a další media
  avatars: {
    text: 'Avatary poskytnuty pod licencí CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/'
  }
};

/**
 * Licenční informace pro knihovny třetích stran
 */
export const thirdPartyLibraries = [
  {
    name: 'MapLibre GL JS',
    license: 'BSD 3-Clause',
    url: 'https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt'
  },
  {
    name: 'React',
    license: 'MIT',
    url: 'https://github.com/facebook/react/blob/main/LICENSE'
  },
  {
    name: 'Next.js',
    license: 'MIT',
    url: 'https://github.com/vercel/next.js/blob/canary/license.md'
  },
  {
    name: 'Zustand',
    license: 'MIT',
    url: 'https://github.com/pmndrs/zustand/blob/main/LICENSE'
  },
  {
    name: 'TypeScript',
    license: 'Apache 2.0',
    url: 'https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt'
  }
];
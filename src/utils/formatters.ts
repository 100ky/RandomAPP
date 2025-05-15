/**
 * Funkce pro formátování velikosti souborů
 */

/**
 * Formátuje velikost v bytech na čitelný formát (KB, MB, GB)
 * @param bytes - Velikost v bytech
 * @returns Naformátovaná velikost s jednotkou
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const digitGroups = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, digitGroups)).toFixed(2)) + ' ' + units[digitGroups];
}

/**
 * Odhaduje velikost offline mapy podle počtu dlaždic
 * @param tileCount - Počet dlaždic
 * @param avgTileSizeKb - Průměrná velikost jedné dlaždice v KB (výchozí 20 KB)
 * @returns Odhadovaná velikost v bytech
 */
export function estimateOfflineMapSize(tileCount: number, avgTileSizeKb: number = 20): number {
    return tileCount * avgTileSizeKb * 1024; // Převod na byty
}

/**
 * Převede datum na lokální formát
 * @param dateString - Řetězec s datem
 * @returns Naformátované datum v českém formátu
 */
export function formatLocalDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (e) {
        return dateString;
    }
}

/**
 * Zkracuje dlouhé texty a přidává tři tečky na konec
 * @param text - Text k zkrácení
 * @param maxLength - Maximální délka výstupu (výchozí 50 znaků)
 * @returns Zkrácený text s třemi tečkami nebo původní text, pokud byl kratší než maxLength
 */
export function truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formátuje vzdálenost v metrech na čitelný formát (metry nebo kilometry)
 * 
 * @param meters Vzdálenost v metrech
 * @returns Naformátovaná vzdálenost
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(2)} km`;
  }
};

/**
 * Formátuje čas v milisekundách na čitelný formát (minuty nebo hodiny a minuty)
 * 
 * @param milliseconds Čas v milisekundách
 * @returns Naformátovaný čas
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours} h ${remainingMinutes} min`;
  } else {
    return `${minutes} min`;
  }
};

/**
 * Formátuje skóre s oddělením tisíců
 * 
 * @param score Skóre k naformátování
 * @returns Naformátované skóre
 */
export const formatScore = (score: number): string => {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/**
 * Správce zvuků pro aplikaci RandomAPP
 * 
 * Tato třída poskytuje metody pro přehrávání zvukových efektů
 * v různých částech aplikace s podporou nastavení hlasitosti
 * a možností vypnout zvuk.
 */

// Typy zvuků dostupných v aplikaci
enum SoundType {
  GAME_START = 'game-start',
  DISCOVER = 'discover-sound',
  STEP = 'step-sound',
  ACHIEVEMENT = 'achievement'
}

// Rozhraní pro konfiguraci zvuku
interface SoundOptions {
  volume?: number; // hlasitost v rozsahu 0-1
  loop?: boolean;  // zda se má zvuk opakovat
  rate?: number;   // rychlost přehrávání (1 = normální)
}

// Výchozí možnosti pro každý typ zvuku
const DEFAULT_OPTIONS: Record<SoundType, SoundOptions> = {
  [SoundType.GAME_START]: { volume: 0.6, loop: false },
  [SoundType.DISCOVER]: { volume: 0.5, loop: false },
  [SoundType.STEP]: { volume: 0.2, loop: false },
  [SoundType.ACHIEVEMENT]: { volume: 0.7, loop: false },
};

/**
 * Třída pro správu přehrávání zvuků v aplikaci
 */
class SoundManager {
  private static instance: SoundManager;
  private soundEnabled: boolean;
  private volume: number;
  private cache: Map<string, HTMLAudioElement>;
  
  /**
   * Privátní konstruktor (singleton)
   */  private constructor() {
    // Bezpečný přístup k localStorage s kontrolou dostupnosti (řeší problém při SSR)
    let storageEnabled = false;
    let soundEnabledValue = true;
    let volumeValue = 1;

    try {
      storageEnabled = typeof window !== 'undefined' && window.localStorage !== undefined;
      if (storageEnabled) {
        soundEnabledValue = localStorage.getItem('sound_enabled') !== 'false';
        volumeValue = parseFloat(localStorage.getItem('sound_volume') || '1');
      }
    } catch (e) {
      console.warn('localStorage není dostupný:', e);
    }

    // Nastavení výchozích hodnot
    this.soundEnabled = soundEnabledValue;
    this.volume = volumeValue;
    
    // Inicializovat cache pro audio elementy
    this.cache = new Map();
  }
  
  /**
   * Získat instanci SoundManager (singleton pattern)
   */
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }
  
  /**
   * Přehrát zvukový efekt
   * 
   * @param type Typ zvuku k přehrání
   * @param options Volitelné možnosti přehrávání
   * @returns Promise který se vyřeší po přehrání nebo při chybě
   */
  public play(type: SoundType, options?: SoundOptions): Promise<void> {
    // Pokud jsou zvuky vypnuté, nic nepřehrávat
    if (!this.soundEnabled) {
      return Promise.resolve();
    }
    
    // Sloučit výchozí možnosti s uživatelskými
    const finalOptions = {
      ...DEFAULT_OPTIONS[type],
      ...options
    };
    
    try {
      // Získat audio element (z cache nebo vytvořit nový)
      let audio = this.getAudio(type);
      
      // Nastavit možnosti
      audio.volume = finalOptions.volume !== undefined ? 
        finalOptions.volume * this.volume : this.volume;
      
      audio.loop = finalOptions.loop || false;
      
      if (finalOptions.rate !== undefined && 'playbackRate' in audio) {
        audio.playbackRate = finalOptions.rate;
      }
      
      // Resetovat audio pro případ, že bylo již přehráváno
      audio.currentTime = 0;
      
      // Přehrát zvuk
      return audio.play().catch(e => {
        console.log('Chyba při přehrávání zvuku:', e);
        return Promise.resolve();
      });
    } catch (e) {
      console.log('Zvuk není dostupný:', e);
      return Promise.resolve();
    }
  }
    /**
   * Zapnutí/vypnutí zvuku
   * 
   * @param enabled True pro zapnutí zvuku, false pro vypnutí
   */
  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      if (typeof window !== 'undefined' && window.localStorage !== undefined) {
        localStorage.setItem('sound_enabled', enabled.toString());
      }
    } catch (e) {
      console.warn('Nelze uložit nastavení zvuku:', e);
    }
  }
  
  /**
   * Nastavení globální hlasitosti zvuku
   * 
   * @param volume Hlasitost v rozsahu 0-1
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    try {
      if (typeof window !== 'undefined' && window.localStorage !== undefined) {
        localStorage.setItem('sound_volume', this.volume.toString());
      }
    } catch (e) {
      console.warn('Nelze uložit nastavení hlasitosti:', e);
    }
  }
  
  /**
   * Získání stavu zapnutí/vypnutí zvuku
   */
  public isEnabled(): boolean {
    return this.soundEnabled;
  }
  
  /**
   * Získání aktuální hlasitosti
   */
  public getVolume(): number {
    return this.volume;
  }
  
  /**
   * Pomocná metoda pro získání audio elementu
   * 
   * @param type Typ zvuku
   * @returns HTMLAudioElement pro přehrávání
   */
  private getAudio(type: SoundType): HTMLAudioElement {
    const key = `sound_${type}`;
    
    // Pokud zvuk již existuje v cache, vrátit ho
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    // Jinak vytvořit nový audio element
    const audio = new Audio(`/assets/sounds/${type}.mp3`);
    
    // Uložit do cache pro budoucí použití
    this.cache.set(key, audio);
    
    return audio;
  }
}

// Export typů a třídy
export { SoundType };
export type { SoundOptions }; // Použití "export type" pro typ
export { SoundManager };

// Export pohodlné funkce pro přehrávání zvuku
export const playSound = (type: SoundType, options?: SoundOptions): Promise<void> => {
  return SoundManager.getInstance().play(type, options);
};

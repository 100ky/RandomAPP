import { POILocation } from '../types/game';
import { explorerLocations } from './explorer/locations';
import { detectiveLocations } from './detective/locations';
import { bivojLocations } from './bivoj/locations';
import { princeznaLocations } from './princezna/locations';
import { ninjaLocations } from './ninja/locations';

/**
 * Interface pro konfiguraci únikové hry pro konkrétního avatara
 */
export interface AvatarGameConfig {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean; // Zda je hra dostupná nebo skrytá
  locations: POILocation[];
}

/**
 * Seznam konfigurací únikových her pro jednotlivé avatary
 * Prozatím je aktivní pouze Průzkumník, ostatní jsou skryté (isAvailable: false)
 */
export const avatarGames: AvatarGameConfig[] = [
  {
    id: 'explorer',
    name: 'Průzkumník Vysokého Mýta',
    description: 'Prozkoumejte historické královské město Vysoké Mýto a jeho významné památky. Řešte hádanky inspirované skutečnými historickými fakty a objevujte tajemství staletých staveb.',
    isAvailable: true,
    locations: explorerLocations
  },
  {
    id: 'detective',
    name: 'Detektiv a záhada ztraceného pokladu',
    description: 'Záhada ztraceného pokladu čeká na své rozluštění. Stopujte indicie, vyslýchejte svědky a najděte ukrytý poklad.',
    isAvailable: false, 
    locations: detectiveLocations
  },
  {
    id: 'Bivoj',
    name: 'Bivoj a jeho hrdinské činy',
    description: 'Projděte ve stopách legendárního silného muže Bivoje a dokažte svou odvahu a sílu při plnění hrdinských úkolů.',
    isAvailable: false,
    locations: bivojLocations
  },
  {
    id: 'princezna',
    name: 'Princezna a zlomená kletba',
    description: 'Pomozte princezně najít kouzelné předměty, které zlomí kletbu uvalenou na město. Čeká vás dobrodružství plné kouzel a tajemství.',
    isAvailable: false,
    locations: princeznaLocations
  },
  {
    id: 'ninja',
    name: 'Ninja a tajemství dávného řádu',
    description: 'Tiše prozkoumejte každý kout města a objevte tajemství dávno zapomenutého řádu ninjů, který kdysi chránil tento kraj.',
    isAvailable: false,
    locations: ninjaLocations
  }
];

/**
 * Získá dostupné (aktivní) avatary pro zobrazení ve výběru
 */
export const getAvailableAvatars = () => {
  return avatarGames.filter(game => game.isAvailable);
};

/**
 * Získá všechny avatary bez ohledu na jejich dostupnost
 */
export const getAllAvatars = () => {
  return avatarGames;
};

/**
 * Získá lokace podle ID avatara
 * @param avatarId ID avatara
 * @returns Lokace pro daného avatara nebo prázdné pole, pokud není hra dostupná
 */
export const getLocationsByAvatarId = (avatarId: string): POILocation[] => {
  const game = avatarGames.find(game => game.id === avatarId);
  return game?.isAvailable ? game.locations : [];
};

/**
 * Získá konfiguraci hry podle ID avatara
 * @param avatarId ID avatara
 * @returns Konfigurace hry nebo undefined, pokud avatar neexistuje
 */
export const getGameConfigByAvatarId = (avatarId: string): AvatarGameConfig | undefined => {
  return avatarGames.find(game => game.id === avatarId);
};

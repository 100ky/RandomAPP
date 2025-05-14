export interface Puzzle {
    id: string;
    title: string;
    description: string;
    question: string;
    answer: string;
    hints: string[];
    locationId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    image?: string;
    type?: 'text' | 'image' | 'code' | 'multiple-choice';
    choices?: string[]; // pro multiple-choice hádanky
}

export type BadgeCategory = 'exploration' | 'puzzle' | 'activity' | 'special';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface POILocation {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  description: string;
  shortDescription?: string;
  radius: number; // Poloměr v metrech, ve kterém lze lokaci objevit
  puzzle: Omit<Puzzle, 'locationId'> & { locationId?: string };
  qrCode?: string; // Volitelný QR kód pro alternativní objevení
  image?: string; // Cesta k obrázku lokace, pokud existuje
  iconUrl?: string; // URL ikony pro zobrazení na mapě
  unlockType: 'gps' | 'qr' | 'both'; // Jak lze lokaci odemknout
  discovered?: boolean; // Zda byla lokace objevena uživatelem
  latitude?: number; // Pro kompatibilitu s mapovými operacemi
  longitude?: number; // Pro kompatibilitu s mapovými operacemi
}

/**
 * Stav stahování a ukládání offline map
 */
export type OfflineMapsStatus = 'not-downloaded' | 'downloading' | 'downloaded' | 'error' | 'updating';

export interface Location {
    id: string;
    name: string;
    description: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    puzzles: Puzzle[];
    image?: string;
    category?: string;
    isUnlocked?: boolean;
}

export interface PlayerProgress {
    solvedPuzzles: {
        [puzzleId: string]: {
            solved: boolean;
            timestamp: number;
            attempts: number;
            hintsUsed: number;
            timeSpent: number;
        }
    };
    score: number;
    visitedLocations: string[];
    achievements: string[];
    lastPlayed: number;
    username?: string;
    avatarId?: string;
    steps: number;
    distanceMeters: number;
    badges?: {
        [badgeId: string]: {
            earned: boolean;
            earnedAt: number;
            progress?: number;
            maxProgress?: number;
        }
    };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: string; // popis podmínky pro získání
    points: number;
    isSecret?: boolean; // některé úspěchy mohou být skryté
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: BadgeCategory;
    rarity: BadgeRarity;
    earnCondition: string;
    points: number;
    isSecret?: boolean;
    isProgressBased?: boolean;
    maxProgress?: number;
    unlockMessage?: string;
}
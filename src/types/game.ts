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

export interface POILocation {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  description: string;
  shortDescription?: string;
  radius: number;
  puzzle: Omit<Puzzle, 'locationId'> & { locationId?: string };
  qrCode?: string;
  image?: string;
  unlockType: 'gps' | 'qr' | 'both';
}

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
    category: 'exploration' | 'puzzle' | 'activity' | 'special';
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    earnCondition: string;
    points: number;
    isSecret?: boolean;
    isProgressBased?: boolean;
    maxProgress?: number;
    unlockMessage?: string;
}
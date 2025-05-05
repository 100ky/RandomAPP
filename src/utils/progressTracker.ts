// Progress Tracker - ukládání herního postupu
import { PuzzleLocation } from '../types/game';

interface GameProgress {
  solvedPuzzles: string[];
  totalPoints: number;
  startTime: number | null;
  lastPlayTime: number;
  achievements: {
    [key: string]: boolean;
  };
  visitedLocations: string[];
}

const ACHIEVEMENTS = {
  FIRST_PUZZLE: 'Začátečník',
  HALF_PUZZLES: 'Na půli cesty',
  ALL_PUZZLES: 'Mistr hádanek',
  SPEED_RUN: 'Rychlík',
  EXPLORER: 'Průzkumník',
};

// Výchozí stav
const defaultProgress: GameProgress = {
  solvedPuzzles: [],
  totalPoints: 0,
  startTime: null,
  lastPlayTime: 0,
  achievements: {
    [ACHIEVEMENTS.FIRST_PUZZLE]: false,
    [ACHIEVEMENTS.HALF_PUZZLES]: false,
    [ACHIEVEMENTS.ALL_PUZZLES]: false,
    [ACHIEVEMENTS.SPEED_RUN]: false,
    [ACHIEVEMENTS.EXPLORER]: false,
  },
  visitedLocations: [],
};

// Klíč pro localStorage
const PROGRESS_KEY = 'vysokeMytoDungeonProgress';

/**
 * Načíst uložený postup hry z localStorage
 */
export function loadGameProgress(): GameProgress {
  try {
    const savedData = localStorage.getItem(PROGRESS_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Nepodařilo se načíst herní postup:', error);
  }
  
  return { ...defaultProgress };
}

/**
 * Uložit aktuální postup hry
 */
export function saveGameProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Nepodařilo se uložit herní postup:', error);
  }
}

/**
 * Resetovat herní postup
 */
export function resetGameProgress(): GameProgress {
  const freshProgress = { ...defaultProgress };
  saveGameProgress(freshProgress);
  return freshProgress;
}

/**
 * Přidat vyřešenou hádanku do postupu
 */
export function updateSolvedPuzzle(puzzleId: string, points: number): GameProgress {
  const progress = loadGameProgress();
  
  // Kontrola, zda už hádanka není vyřešena
  if (!progress.solvedPuzzles.includes(puzzleId)) {
    progress.solvedPuzzles.push(puzzleId);
    progress.totalPoints += points;
    
    // Aktualizovat čas
    progress.lastPlayTime = Date.now();
    
    // Nastavit čas začátku, pokud je to první hádanka
    if (progress.startTime === null) {
      progress.startTime = Date.now();
    }
    
    // Kontrola achievementů
    checkAndUpdateAchievements(progress);
    
    // Uložit postup
    saveGameProgress(progress);
  }
  
  return progress;
}

/**
 * Přidat navštívenou lokaci
 */
export function addVisitedLocation(locationId: string): GameProgress {
  const progress = loadGameProgress();
  
  if (!progress.visitedLocations.includes(locationId)) {
    progress.visitedLocations.push(locationId);
    progress.lastPlayTime = Date.now();
    
    // Kontrola achievementů
    checkAndUpdateAchievements(progress);
    
    saveGameProgress(progress);
  }
  
  return progress;
}

/**
 * Kontrola a aktualizace achievementů
 */
function checkAndUpdateAchievements(progress: GameProgress): void {
  const { solvedPuzzles, startTime, visitedLocations } = progress;
  
  // První vyřešená hádanka
  if (solvedPuzzles.length >= 1) {
    progress.achievements[ACHIEVEMENTS.FIRST_PUZZLE] = true;
  }
  
  // Polovinu hádanek - předpokládáme, že víme kolik jich celkem je
  const TOTAL_PUZZLES = 10; // Nastavte podle skutečného počtu
  if (solvedPuzzles.length >= TOTAL_PUZZLES / 2) {
    progress.achievements[ACHIEVEMENTS.HALF_PUZZLES] = true;
  }
  
  // Všechny hádanky
  if (solvedPuzzles.length >= TOTAL_PUZZLES) {
    progress.achievements[ACHIEVEMENTS.ALL_PUZZLES] = true;
    
    // Speedrun achievement - dokončeno pod 60 minut
    if (startTime && (Date.now() - startTime) < 60 * 60 * 1000) {
      progress.achievements[ACHIEVEMENTS.SPEED_RUN] = true;
    }
  }
  
  // Navštívení všech lokací
  const TOTAL_LOCATIONS = 15; // Nastavte podle skutečného počtu
  if (visitedLocations.length >= TOTAL_LOCATIONS) {
    progress.achievements[ACHIEVEMENTS.EXPLORER] = true;
  }
}

/**
 * Získat informace o achieved achievementech
 */
export function getAchievedAchievements(): { name: string; achieved: boolean }[] {
  const progress = loadGameProgress();
  
  return Object.entries(progress.achievements).map(([name, achieved]) => ({
    name,
    achieved,
  }));
}

/**
 * Kontrola, zda je hádanka již vyřešena
 */
export function isPuzzleSolved(puzzleId: string): boolean {
  const progress = loadGameProgress();
  return progress.solvedPuzzles.includes(puzzleId);
}

/**
 * Získat celkový počet bodů
 */
export function getTotalPoints(): number {
  const progress = loadGameProgress();
  return progress.totalPoints;
}

/**
 * Získat počet vyřešených hádanek
 */
export function getSolvedPuzzlesCount(): number {
  const progress = loadGameProgress();
  return progress.solvedPuzzles.length;
}

/**
 * Získat množství procent dokončení hry
 */
export function getCompletionPercentage(totalPuzzles: number): number {
  const solvedCount = getSolvedPuzzlesCount();
  return (solvedCount / totalPuzzles) * 100;
}
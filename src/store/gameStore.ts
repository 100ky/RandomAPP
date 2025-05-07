import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerProgress } from '../types/game';

interface GameState {
  level: number;
  progress: number;
  isGameActive: boolean;
  playerName: string;
  avatarId: string;
  playerProgress: PlayerProgress;
  
  // Akce
  startGame: () => void;
  endGame: () => void;
  nextLevel: () => void;
  updateProgress: (increment: number) => void;
  setPlayerInfo: (name: string, avatarId: string) => void;
  updatePlayerProgress: (progress: Partial<PlayerProgress>) => void;
  solvePuzzle: (puzzleId: string) => void;
  visitLocation: (locationId: string) => void;
  useHint: (puzzleId: string) => void;
  addSteps: (steps: number) => void;
  addDistance: (meters: number) => void;
}

// Výchozí stav progress objektu
const initialPlayerProgress: PlayerProgress = {
  solvedPuzzles: {},
  score: 0,
  visitedLocations: [],
  achievements: [],
  lastPlayed: Date.now(),
  steps: 0,
  distanceMeters: 0,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      level: 1,
      progress: 0,
      isGameActive: false,
      playerName: '',
      avatarId: 'explorer',
      playerProgress: initialPlayerProgress,

      startGame: () => set({ isGameActive: true, progress: 0, level: 1 }),
      
      endGame: () => set({ isGameActive: false }),
      
      nextLevel: () => set(state => ({ level: state.level + 1, progress: 0 })),
      
      updateProgress: (increment: number) => set(state => {
        const newProgress = Math.min(state.progress + increment, 100);
        if (newProgress >= 100) {
          setTimeout(() => get().nextLevel(), 0);
        }
        return { progress: newProgress };
      }),
      
      setPlayerInfo: (name: string, avatarId: string) => 
        set({ playerName: name, avatarId }),
      
      updatePlayerProgress: (progress: Partial<PlayerProgress>) => 
        set(state => ({ 
          playerProgress: { ...state.playerProgress, ...progress } 
        })),
      
      solvePuzzle: (puzzleId: string) => set(state => {
        const now = Date.now();
        const puzzleEntry = state.playerProgress.solvedPuzzles[puzzleId] || {
          solved: false,
          timestamp: now,
          attempts: 0,
          hintsUsed: 0,
          timeSpent: 0
        };
        
        // Pokud je již vyřešeno, nic neměnit
        if (puzzleEntry.solved) return state;
        
        // Přidat 50 bodů za vyřešení hádanky
        const updatedScore = state.playerProgress.score + 50;
        
        return {
          playerProgress: {
            ...state.playerProgress,
            score: updatedScore,
            solvedPuzzles: {
              ...state.playerProgress.solvedPuzzles,
              [puzzleId]: {
                ...puzzleEntry,
                solved: true,
                timestamp: now
              }
            },
            lastPlayed: now
          }
        };
      }),
      
      visitLocation: (locationId: string) => set(state => {
        // Přidat lokaci pouze pokud ještě nebyla navštívena
        if (state.playerProgress.visitedLocations.includes(locationId)) {
          return state;
        }
        
        return {
          playerProgress: {
            ...state.playerProgress,
            visitedLocations: [...state.playerProgress.visitedLocations, locationId],
            lastPlayed: Date.now()
          }
        };
      }),
      
      useHint: (puzzleId: string) => set(state => {
        const puzzleEntry = state.playerProgress.solvedPuzzles[puzzleId] || {
          solved: false,
          timestamp: Date.now(),
          attempts: 0,
          hintsUsed: 0,
          timeSpent: 0
        };
        
        return {
          playerProgress: {
            ...state.playerProgress,
            solvedPuzzles: {
              ...state.playerProgress.solvedPuzzles,
              [puzzleId]: {
                ...puzzleEntry,
                hintsUsed: puzzleEntry.hintsUsed + 1
              }
            },
            lastPlayed: Date.now()
          }
        };
      }),
      
      // Nové funkce pro sledování kroků a vzdálenosti
      addSteps: (steps: number) => set(state => ({
        playerProgress: {
          ...state.playerProgress,
          steps: state.playerProgress.steps + steps,
          lastPlayed: Date.now()
        }
      })),
      
      addDistance: (meters: number) => set(state => ({
        playerProgress: {
          ...state.playerProgress,
          distanceMeters: state.playerProgress.distanceMeters + meters,
          lastPlayed: Date.now()
        }
      }))
    }),
    {
      name: 'game-storage', // název klíče v lokálním úložišti
      partialize: (state) => ({
        playerName: state.playerName,
        avatarId: state.avatarId,
        playerProgress: state.playerProgress,
      }),
    }
  )
);
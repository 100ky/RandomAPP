import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerProgress, Badge } from '../types/game';
import { badges, getBadgeById } from '../data/badges';

interface GameState {
  level: number;
  progress: number;
  isGameActive: boolean;
  playerName: string;
  avatarId: string;
  playerProgress: PlayerProgress;
  startTime: number | null;
  lastBadgeEarned: Badge | null;
  
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
  getElapsedTime: () => number;
  resetStats: () => void;
  
  // Nové funkce pro správu odznaků
  earnBadge: (badgeId: string) => void;
  checkLocationBasedBadges: () => void;
  checkPuzzleBasedBadges: () => void;
  checkActivityBasedBadges: () => void;
  checkSpecialBadges: () => void;
  clearLastEarnedBadge: () => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;
  getBadgeProgress: (badgeId: string) => number;
  hasBadge: (badgeId: string) => boolean;
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
  badges: {},
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
      startTime: null,
      lastBadgeEarned: null,

      startGame: () => set({ 
        isGameActive: true, 
        progress: 0, 
        level: 1, 
        startTime: Date.now(),
        playerProgress: {
          ...get().playerProgress,
          steps: 0,
          distanceMeters: 0
        }
      }),
      
      endGame: () => set({ isGameActive: false, startTime: null }),
      
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
        
        const newState = {
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
        
        // Kontrola odznaků po vyřešení hádanky
        setTimeout(() => {
          get().checkPuzzleBasedBadges();
          get().checkSpecialBadges();
        }, 0);
        
        return newState;
      }),
      
      visitLocation: (locationId: string) => set(state => {
        // Přidat lokaci pouze pokud ještě nebyla navštívena
        if (state.playerProgress.visitedLocations.includes(locationId)) {
          return state;
        }
        
        const newState = {
          playerProgress: {
            ...state.playerProgress,
            visitedLocations: [...state.playerProgress.visitedLocations, locationId],
            lastPlayed: Date.now()
          }
        };
        
        // Kontrola odznaků po navštívení lokace
        setTimeout(() => {
          get().checkLocationBasedBadges();
          get().checkSpecialBadges();
        }, 0);
        
        return newState;
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
      addSteps: (steps: number) => set(state => {
        const newState = {
          playerProgress: {
            ...state.playerProgress,
            steps: state.playerProgress.steps + steps,
            lastPlayed: Date.now()
          }
        };
        
        // Kontrola odznaků po přidání kroků
        setTimeout(() => {
          get().checkActivityBasedBadges();
          get().checkSpecialBadges();
        }, 0);
        
        return newState;
      }),
      
      addDistance: (meters: number) => set(state => {
        const newState = {
          playerProgress: {
            ...state.playerProgress,
            distanceMeters: state.playerProgress.distanceMeters + meters,
            lastPlayed: Date.now()
          }
        };
        
        // Kontrola odznaků po přidání vzdálenosti
        setTimeout(() => {
          get().checkActivityBasedBadges();
          get().checkSpecialBadges();
        }, 0);
        
        return newState;
      }),
      
      // Nová funkce pro získání uplynulého času
      getElapsedTime: () => {
        const state = get();
        if (!state.startTime) return 0;
        return Math.floor((Date.now() - state.startTime) / 1000);
      },
      
      // Funkce pro resetování statistik při novém startu hry
      resetStats: () => set(state => ({
        playerProgress: {
          ...state.playerProgress,
          steps: 0,
          distanceMeters: 0,
        },
        startTime: Date.now()
      })),
      
      // Nové funkce pro správu odznaků
      earnBadge: (badgeId: string) => set(state => {
        // Kontrola, zda odznak již byl získán
        const playerBadges = state.playerProgress.badges || {};
        if (playerBadges[badgeId]?.earned) return state;
        
        // Získání dat odznaku
        const badgeData = getBadgeById(badgeId);
        if (!badgeData) return state;
        
        // Přidání odznaku a bodů
        const newState = {
          playerProgress: {
            ...state.playerProgress,
            badges: {
              ...playerBadges,
              [badgeId]: {
                earned: true,
                earnedAt: Date.now(),
                progress: badgeData.maxProgress || 1,
                maxProgress: badgeData.maxProgress || 1,
              }
            },
            score: state.playerProgress.score + badgeData.points,
            lastPlayed: Date.now()
          },
          lastBadgeEarned: badgeData, // Uložení posledního získaného odznaku pro zobrazení oznámení
        };
        
        return newState;
      }),
      
      clearLastEarnedBadge: () => set({ lastBadgeEarned: null }),
      
      updateBadgeProgress: (badgeId: string, progress: number) => set(state => {
        const playerBadges = state.playerProgress.badges || {};
        const currentBadge = playerBadges[badgeId];
        const badge = getBadgeById(badgeId);
        
        if (!badge) return state;
        
        // Pokud odznak již byl získán, neaktualizujeme progress
        if (currentBadge?.earned) return state;
        
        const maxProgress = badge.maxProgress || 1;
        const newProgress = Math.min(progress, maxProgress);
        
        // Odznak získán, pokud dosáhl maxima
        const earned = newProgress >= maxProgress;
        
        const badgeState = {
          earned,
          earnedAt: earned ? Date.now() : 0,
          progress: newProgress,
          maxProgress,
        };
        
        const newState = {
          playerProgress: {
            ...state.playerProgress,
            badges: {
              ...playerBadges,
              [badgeId]: badgeState
            },
            // Pokud byl odznak získán, přidáme body
            score: earned ? state.playerProgress.score + badge.points : state.playerProgress.score,
            lastPlayed: Date.now()
          },
          lastBadgeEarned: earned ? badge : state.lastBadgeEarned,
        };
        
        return newState;
      }),
      
      getBadgeProgress: (badgeId: string) => {
        const state = get();
        const playerBadges = state.playerProgress.badges || {};
        return playerBadges[badgeId]?.progress || 0;
      },
      
      hasBadge: (badgeId: string) => {
        const state = get();
        const playerBadges = state.playerProgress.badges || {};
        return !!playerBadges[badgeId]?.earned;
      },
      
      // Kontrola odznaků podle kategorií
      checkLocationBasedBadges: () => {
        const state = get();
        const visitedLocations = state.playerProgress.visitedLocations.length;
        
        // První lokace
        if (visitedLocations >= 1) {
          get().earnBadge('first_location');
        }
        
        // 3 lokace
        if (visitedLocations >= 3) {
          get().earnBadge('explorer_novice');
        } else if (visitedLocations > 0) {
          get().updateBadgeProgress('explorer_novice', visitedLocations);
        }
        
        // 7 lokací
        if (visitedLocations >= 7) {
          get().earnBadge('explorer_advanced');
        } else if (visitedLocations > 0) {
          get().updateBadgeProgress('explorer_advanced', visitedLocations);
        }
        
        // Všechny lokace (předpokládáme 10 lokací)
        if (visitedLocations >= 10) {
          get().earnBadge('explorer_master');
        } else if (visitedLocations > 0) {
          get().updateBadgeProgress('explorer_master', visitedLocations);
        }
      },
      
      checkPuzzleBasedBadges: () => {
        const state = get();
        const solvedPuzzles = Object.values(state.playerProgress.solvedPuzzles).filter(p => p.solved).length;
        const puzzlesNoHints = Object.values(state.playerProgress.solvedPuzzles).filter(p => p.solved && p.hintsUsed === 0).length;
        
        // První hádanka
        if (solvedPuzzles >= 1) {
          get().earnBadge('puzzle_first');
        }
        
        // 5 hádanek
        if (solvedPuzzles >= 5) {
          get().earnBadge('puzzle_solver');
        } else if (solvedPuzzles > 0) {
          get().updateBadgeProgress('puzzle_solver', solvedPuzzles);
        }
        
        // Všechny hádanky (předpokládáme 10 hádanek)
        if (solvedPuzzles >= 10) {
          get().earnBadge('puzzle_master');
        } else if (solvedPuzzles > 0) {
          get().updateBadgeProgress('puzzle_master', solvedPuzzles);
        }
        
        // Perfektní řešení (bez nápovědy)
        if (puzzlesNoHints >= 3) {
          get().earnBadge('perfect_solver');
        } else if (puzzlesNoHints > 0) {
          get().updateBadgeProgress('perfect_solver', puzzlesNoHints);
        }
      },
      
      checkActivityBasedBadges: () => {
        const state = get();
        const { steps, distanceMeters } = state.playerProgress;
        
        // 1000 kroků
        if (steps >= 1000) {
          get().earnBadge('first_1000_steps');
        } else if (steps > 0) {
          get().updateBadgeProgress('first_1000_steps', steps);
        }
        
        // 5000 kroků
        if (steps >= 5000) {
          get().earnBadge('walker');
        } else if (steps > 0) {
          get().updateBadgeProgress('walker', steps);
        }
        
        // 5km vzdálenost
        if (distanceMeters >= 5000) {
          get().earnBadge('marathon');
        } else if (distanceMeters > 0) {
          get().updateBadgeProgress('marathon', distanceMeters);
        }
      },
      
      checkSpecialBadges: () => {
        const state = get();
        const now = new Date();
        const hour = now.getHours();
        
        // Ranní ptáče (mezi 5:00 a 8:00)
        if (hour >= 5 && hour < 8) {
          get().earnBadge('early_bird');
        }
        
        // Noční sova (po 22:00)
        if (hour >= 22 || hour < 5) {
          get().earnBadge('night_owl');
        }
        
        // Kontrola rychlíka
        // Implementace závisí na tom, jak sledujete čas řešení hádanek
        
        // Kontrola dovršitele
        // Pokud má uživatel všechny ostatní odznaky (kromě completionist)
        const playerBadges = state.playerProgress.badges || {};
        const earnedBadges = Object.keys(playerBadges).filter(id => 
          playerBadges[id]?.earned && id !== 'completionist'
        );
        
        if (earnedBadges.length >= badges.length - 1) {
          get().earnBadge('completionist');
        }
      },
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
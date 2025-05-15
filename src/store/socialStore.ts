import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerProgress, Route, TeamMember, LeaderboardEntry } from '../types/social';

interface SocialState {
  // Týmový režim
  teamId: string | null;
  teamName: string | null;
  teamMembers: TeamMember[];
  isTeamMode: boolean;
  inviteCode: string | null;
  lastKnownLocations: Record<string, { lat: number; lng: number; timestamp: number }>;
  
  // Žebříčky
  leaderboard: LeaderboardEntry[];
  friendsList: string[];
  
  // Trasy
  savedRoutes: Route[];
  currentRoute: Route | null;
  isRecordingRoute: boolean;
  
  // Akce - Týmový režim
  startTeamMode: (teamName: string) => void;
  endTeamMode: () => void;
  generateInviteCode: () => string;
  joinTeamWithCode: (code: string) => Promise<boolean>;
  updateMemberLocation: (memberId: string, location: { lat: number; lng: number }) => void;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (memberId: string) => void;
  
  // Akce - Žebříčky
  addLeaderboardEntry: (entry: LeaderboardEntry) => void;
  updateLeaderboard: () => Promise<void>;
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  
  // Akce - Trasy
  startRouteRecording: (routeName: string) => void;
  stopRouteRecording: () => Route | null;
  addRoutePoint: (lat: number, lng: number) => void;
  saveRoute: (route: Route) => void;
  deleteRoute: (routeId: string) => void;
  shareRoute: (routeId: string) => Promise<string>;
  importRoute: (sharedCode: string) => Promise<boolean>;
}

const initialState = {
  teamId: null,
  teamName: null,
  teamMembers: [],
  isTeamMode: false,
  inviteCode: null,
  lastKnownLocations: {},
  leaderboard: [],
  friendsList: [],
  savedRoutes: [],
  currentRoute: null,
  isRecordingRoute: false,
};

// Pomocné funkce pro generování ID a kódů
const generateUniqueId = () => Math.random().toString(36).substring(2, 15);
const generateInviteCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Implementace týmového režimu
      startTeamMode: (teamName: string) => {
        const teamId = generateUniqueId();
        const inviteCode = generateInviteCode();
        
        set({
          teamId,
          teamName,
          isTeamMode: true,
          inviteCode,
          teamMembers: [
            {
              id: 'current-user', // Později nahradit ID aktuálního uživatele
              name: 'Já', // Později nahradit jménem aktuálního uživatele
              avatarId: 'explorer', // Později nahradit avatarem aktuálního uživatele
              isLeader: true,
              lastLocation: null,
              isOnline: true,
            }
          ]
        });
        
        return inviteCode;
      },
      
      endTeamMode: () => {
        set({
          teamId: null,
          teamName: null,
          isTeamMode: false,
          inviteCode: null,
          teamMembers: [],
          lastKnownLocations: {}
        });
      },
      
      generateInviteCode: () => {
        const code = generateInviteCode();
        set({ inviteCode: code });
        return code;
      },
      
      joinTeamWithCode: async (code: string) => {
        // Zde by byla implementace připojení k týmu pomocí API
        // Pro demo účely předpokládejme úspěšné připojení
        try {
          // Simulace API volání pro připojení k týmu
          // Později nahradit skutečným API voláním
          const mockTeamData = {
            teamId: generateUniqueId(),
            teamName: "Průzkumný tým",
            members: [
              {
                id: "leader-1",
                name: "Vedoucí týmu",
                avatarId: "explorer",
                isLeader: true,
                lastLocation: { lat: 50.073658, lng: 14.418540 },
                isOnline: true,
              }
            ]
          };
          
          set({
            teamId: mockTeamData.teamId,
            teamName: mockTeamData.teamName,
            isTeamMode: true,
            teamMembers: mockTeamData.members,
            inviteCode: code
          });
          
          return true;
        } catch (error) {
          console.error("Chyba při připojování k týmu:", error);
          return false;
        }
      },
      
      updateMemberLocation: (memberId: string, location: { lat: number; lng: number }) => {
        set(state => ({
          lastKnownLocations: {
            ...state.lastKnownLocations,
            [memberId]: {
              ...location,
              timestamp: Date.now(),
            }
          }
        }));
      },
      
      addTeamMember: (member: TeamMember) => {
        set(state => ({
          teamMembers: [...state.teamMembers, member]
        }));
      },
      
      removeTeamMember: (memberId: string) => {
        set(state => ({
          teamMembers: state.teamMembers.filter(member => member.id !== memberId)
        }));
      },
      
      // Implementace žebříčků
      addLeaderboardEntry: (entry: LeaderboardEntry) => {
        set(state => {
          const existingEntryIndex = state.leaderboard.findIndex(e => e.playerId === entry.playerId);
          
          if (existingEntryIndex !== -1) {
            // Aktualizovat existující záznam, pokud je nové skóre vyšší
            const existingEntry = state.leaderboard[existingEntryIndex];
            if (entry.score > existingEntry.score) {
              const newLeaderboard = [...state.leaderboard];
              newLeaderboard[existingEntryIndex] = entry;
              
              // Seřadit žebříček podle skóre
              newLeaderboard.sort((a, b) => b.score - a.score);
              
              return { leaderboard: newLeaderboard };
            }
            return state;
          } else {
            // Přidat nový záznam
            const newLeaderboard = [...state.leaderboard, entry];
            newLeaderboard.sort((a, b) => b.score - a.score);
            return { leaderboard: newLeaderboard };
          }
        });
      },
      
      updateLeaderboard: async () => {
        // Zde by bylo volání API pro aktualizaci globálního žebříčku
        // Pro demo účely vytvoříme ukázkový žebříček
        try {
          // Simulace API volání
          const mockLeaderboardData: LeaderboardEntry[] = [
            { 
              playerId: "player1", 
              playerName: "Průzkumník123", 
              score: 1250, 
              rank: 1, 
              avatarId: "explorer",
              achievements: ["explorer_master", "perfect_solver"] 
            },
            { 
              playerId: "player2", 
              playerName: "MazeRunner", 
              score: 980, 
              rank: 2, 
              avatarId: "detective",
              achievements: ["explorer_advanced", "puzzle_master"] 
            },
            { 
              playerId: "player3", 
              playerName: "AdventureSeeker", 
              score: 780, 
              rank: 3, 
              avatarId: "ninja",
              achievements: ["explorer_novice"] 
            }
          ];
          
          set({ leaderboard: mockLeaderboardData });
        } catch (error) {
          console.error("Chyba při aktualizaci žebříčku:", error);
        }
      },
      
      addFriend: (friendId: string) => {
        set(state => {
          if (!state.friendsList.includes(friendId)) {
            return { friendsList: [...state.friendsList, friendId] };
          }
          return state;
        });
      },
      
      removeFriend: (friendId: string) => {
        set(state => ({
          friendsList: state.friendsList.filter(id => id !== friendId)
        }));
      },
      
      // Implementace zaznamenávání a sdílení tras
      startRouteRecording: (routeName: string) => {
        const newRoute: Route = {
          id: generateUniqueId(),
          name: routeName,
          createdAt: Date.now(),
          points: [],
          totalDistance: 0,
          duration: 0
        };
        
        set({
          currentRoute: newRoute,
          isRecordingRoute: true
        });
      },
      
      stopRouteRecording: () => {
        const { currentRoute, isRecordingRoute } = get();
        
        if (!isRecordingRoute || !currentRoute) return null;
        
        const endTime = Date.now();
        const duration = endTime - currentRoute.createdAt;
        
        const completedRoute: Route = {
          ...currentRoute,
          duration
        };
        
        // Uložit trasu do seznamu uložených tras
        get().saveRoute(completedRoute);
        
        set({
          currentRoute: null,
          isRecordingRoute: false
        });
        
        return completedRoute;
      },
      
      addRoutePoint: (lat: number, lng: number) => {
        set(state => {
          if (!state.isRecordingRoute || !state.currentRoute) return state;
          
          const newPoint = { lat, lng, timestamp: Date.now() };
          const points = [...state.currentRoute.points, newPoint];
          
          // Vypočítat vzdálenost od posledního bodu
          let newTotalDistance = state.currentRoute.totalDistance;
          if (points.length > 1) {
            const lastPoint = points[points.length - 2];
            const distance = calculateDistance(
              lastPoint.lat, lastPoint.lng, 
              newPoint.lat, newPoint.lng
            );
            newTotalDistance += distance;
          }
          
          return {
            currentRoute: {
              ...state.currentRoute,
              points,
              totalDistance: newTotalDistance
            }
          };
        });
      },
      
      saveRoute: (route: Route) => {
        set(state => ({
          savedRoutes: [...state.savedRoutes, route]
        }));
      },
      
      deleteRoute: (routeId: string) => {
        set(state => ({
          savedRoutes: state.savedRoutes.filter(route => route.id !== routeId)
        }));
      },
      
      shareRoute: async (routeId: string) => {
        const { savedRoutes } = get();
        const route = savedRoutes.find(r => r.id === routeId);
        
        if (!route) throw new Error("Trasa nebyla nalezena");
        
        // Zde bychom mohli implementovat sdílení přes API
        // Pro demo účely vytvoříme sdílecí kód
        const routeData = JSON.stringify(route);
        const encodedRoute = btoa(routeData);
        
        // Simulace sdílecího kódu (v realné implementaci by byl vygenerován serverem)
        return `RANDOM-${encodedRoute.substring(0, 12)}`;
      },
      
      importRoute: async (sharedCode: string) => {
        try {
          if (!sharedCode.startsWith("RANDOM-")) {
            throw new Error("Neplatný sdílecí kód");
          }
          
          // V reálné implementaci by zde bylo volání API
          // Pro demo vytvoříme falešnou funkčnost
          
          const mockImportedRoute: Route = {
            id: generateUniqueId(),
            name: "Importovaná trasa",
            createdAt: Date.now() - 3600000, // Před hodinou
            points: [
              { lat: 50.0755, lng: 14.4378, timestamp: Date.now() - 3600000 },
              { lat: 50.0757, lng: 14.4380, timestamp: Date.now() - 3590000 },
              { lat: 50.0760, lng: 14.4385, timestamp: Date.now() - 3570000 },
            ],
            totalDistance: 120,
            duration: 600000, // 10 minut
            isImported: true
          };
          
          get().saveRoute(mockImportedRoute);
          return true;
        } catch (error) {
          console.error("Chyba při importu trasy:", error);
          return false;
        }
      }
    }),
    {
      name: 'social-storage',
      partialize: (state) => ({
        friendsList: state.friendsList,
        savedRoutes: state.savedRoutes,
        leaderboard: state.leaderboard
      }),
    }
  )
);

// Pomocná funkce pro výpočet vzdálenosti mezi dvěma body v metrech
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // poloměr Země v metrech
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

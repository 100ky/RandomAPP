import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerProgress, Route, TeamMember, LeaderboardEntry, ChatMessage } from '../types/social';
import { TeamEvent, TeamEventType } from '../components/TeamEventNotification';
import { v4 as uuidv4 } from 'uuid';

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
  sharedRoutes: Route[];
  currentRoute: Route | null;
  isRecordingRoute: boolean;
  
  // Notifikace
  teamEvents: TeamEvent[];
  unreadEventsCount: number;
  
  // Chat
  chatMessages: ChatMessage[];
  unreadChatCount: number;
  
  // Akce - Týmový režim
  startTeamMode: (teamName: string) => void;
  endTeamMode: () => void;
  generateInviteCode: () => string;
  joinTeamWithCode: (code: string) => Promise<boolean>;
  updateMemberLocation: (memberId: string, location: { lat: number; lng: number; timestamp: number }) => void;
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
  addRoutePoint: (point: { lat: number; lng: number; timestamp: number }) => void;
  saveRoute: (route: Route) => void;
  deleteRoute: (routeId: string) => void;
  shareRoute: (route: Route) => string;
  importRoute: (sharedCode: string) => Promise<boolean>;
    // Akce - Notifikace
  addTeamEvent: (type: TeamEventType, memberId: string, memberName: string, message: string) => void;
  dismissTeamEvent: (eventId: string) => void;
  markAllEventsAsRead: () => void;
  
  // Akce - Chat
  sendChatMessage: (text: string) => void;
  addChatMessage: (memberId: string, memberName: string, text: string, isSystem?: boolean) => void;
  markAllChatAsRead: () => void;
  clearChatHistory: () => void;
}

const createTeamEvent = (
  type: TeamEventType, 
  memberId: string, 
  memberName: string, 
  message: string
): TeamEvent => ({
  id: uuidv4(),
  type,
  timestamp: Date.now(),
  memberId,
  memberName,
  message,
  read: false
});

export const useSocialStore = create(
  persist<SocialState>(
    (set, get) => ({      // Počáteční stavy
      teamId: null,
      teamName: null,
      teamMembers: [],
      isTeamMode: false,
      inviteCode: null,
      lastKnownLocations: {},
      leaderboard: [],
      friendsList: [],
      savedRoutes: [],
      sharedRoutes: [],
      currentRoute: null,
      isRecordingRoute: false,
      teamEvents: [],
      unreadEventsCount: 0,
      chatMessages: [],
      unreadChatCount: 0,
      
      // Týmový režim - funkce
      startTeamMode: (teamName: string) => {
        const teamId = uuidv4();
        const currentUser: TeamMember = {
          id: 'current-user',
          name: 'Já',
          isLeader: true,
        };
        
        set({
          teamId,
          teamName,
          teamMembers: [currentUser],
          isTeamMode: true,
          inviteCode: get().generateInviteCode(),
        });
        
        // Přidat událost týmu
        get().addTeamEvent('join', 'current-user', 'Já', `Tým "${teamName}" byl vytvořen`);
      },
      
      endTeamMode: () => {
        const teamName = get().teamName;
        set({
          teamId: null,
          teamName: null,
          teamMembers: [],
          isTeamMode: false,
          inviteCode: null,
          lastKnownLocations: {},
        });
        
        // Přidat událost týmu
        get().addTeamEvent('leave', 'current-user', 'Já', `Opustili jste tým "${teamName}"`);
      },
      
      generateInviteCode: () => {
        // Jednoduchý kód pro demo - v produkci by byl složitější
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        set({ inviteCode: code });
        return code;
      },
      
      joinTeamWithCode: async (code: string) => {
        // Simulace API volání pro ověření kódu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Pro demo: 50% šance na úspěch s náhodným týmem
        const success = Math.random() > 0.5;
        if (success) {
          const teamId = uuidv4();
          const teamName = `Tým ${Math.floor(Math.random() * 100)}`;
          const leader: TeamMember = {
            id: uuidv4(),
            name: `Člen ${Math.floor(Math.random() * 10)}`,
            isLeader: true,
          };
          const currentUser: TeamMember = {
            id: 'current-user',
            name: 'Já',
            isLeader: false,
          };
          
          set({
            teamId,
            teamName,
            teamMembers: [leader, currentUser],
            isTeamMode: true,
            inviteCode: code,
          });
          
          // Přidat událost týmu
          get().addTeamEvent('join', 'current-user', 'Já', `Připojili jste se k týmu "${teamName}"`);
        }
        
        return success;
      },
      
      updateMemberLocation: (memberId: string, location) => {
        set(state => {
          const newLocations = { ...state.lastKnownLocations };
          const oldLocation = newLocations[memberId];
          newLocations[memberId] = location;
          
          // Pokud jde o aktualizaci polohy jiného člena a byl dostatečný pohyb, vytvořit událost
          if (memberId !== 'current-user' && oldLocation) {
            // Výpočet vzdálenosti mezi starou a novou polohou
            const distance = Math.sqrt(
              Math.pow(location.lat - oldLocation.lat, 2) + 
              Math.pow(location.lng - oldLocation.lng, 2)
            ) * 111000; // přibližný převod na metry
            
            // Pokud se člen přesunul více než 100 metrů, vytvořit událost
            if (distance > 100) {
              const member = state.teamMembers.find(m => m.id === memberId);
              if (member) {
                get().addTeamEvent(
                  'location-update',
                  memberId,
                  member.name,
                  `${member.name} se přesunul o ${Math.round(distance)}m.`
                );
              }
            }
          }
          
          return { lastKnownLocations: newLocations };
        });
      },
      
      addTeamMember: (member) => {
        set(state => ({ 
          teamMembers: [...state.teamMembers, member]
        }));
        
        // Přidat událost týmu
        get().addTeamEvent('join', member.id, member.name, `${member.name} se připojil k týmu`);
      },
      
      removeTeamMember: (memberId) => {
        set(state => {
          const member = state.teamMembers.find(m => m.id === memberId);
          const memberName = member?.name || 'Neznámý člen';
          
          return {
            teamMembers: state.teamMembers.filter(m => m.id !== memberId),
            lastKnownLocations: Object.entries(state.lastKnownLocations)
              .filter(([id]) => id !== memberId)
              .reduce((acc, [id, loc]) => ({ ...acc, [id]: loc }), {})
          };
        });
        
        // Přidat událost týmu o odchodu člena
        const member = get().teamMembers.find(m => m.id === memberId);
        if (member) {
          get().addTeamEvent('leave', memberId, member.name, `${member.name} opustil tým`);
        }
      },
      
      // Žebříček - funkce
      addLeaderboardEntry: (entry) => {
        set(state => {
          const existingEntryIndex = state.leaderboard.findIndex(e => e.playerId === entry.playerId);
          
          if (existingEntryIndex >= 0) {
            // Aktualizace existujícího záznamu
            const updatedLeaderboard = [...state.leaderboard];
            updatedLeaderboard[existingEntryIndex] = {
              ...updatedLeaderboard[existingEntryIndex],
              ...entry,
              // Zachovat dosažené skóre, pouze pokud je nové vyšší
              score: Math.max(updatedLeaderboard[existingEntryIndex].score, entry.score),
            };
            return { leaderboard: updatedLeaderboard };
          } else {
            // Přidání nového záznamu
            return { leaderboard: [...state.leaderboard, entry] };
          }
        });
      },
      
      updateLeaderboard: async () => {
        // Simulace API volání pro aktualizaci žebříčku
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Pro demo: Vygenerovat náhodné záznamy v žebříčku
        const demoLeaderboard: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
          playerId: `player-${i + 1}`,
          playerName: `Hráč ${i + 1}`,
          score: Math.floor(Math.random() * 10000),
          rank: i + 1,
          avatarId: ['explorer', 'detective', 'Bivoj', 'princezna', 'ninja'][Math.floor(Math.random() * 5)],
          achievements: [],
        }));
        
        // Zachovat skutečné záznamy hráčů
        const currentPlayerEntry = get().leaderboard.find(e => e.playerId === 'current-user');
        if (currentPlayerEntry) {
          demoLeaderboard.push(currentPlayerEntry);
        }
        
        set({ leaderboard: demoLeaderboard });
      },
      
      addFriend: (friendId) => {
        set(state => ({
          friendsList: [...state.friendsList, friendId]
        }));
      },
      
      removeFriend: (friendId) => {
        set(state => ({
          friendsList: state.friendsList.filter(id => id !== friendId)
        }));
      },
      
      // Trasy - funkce
      startRouteRecording: (routeName) => {
        const newRoute: Route = {
          id: uuidv4(),
          name: routeName,
          points: [],
          totalDistance: 0,
          duration: 0,
          startTime: Date.now(),
          endTime: null,
          isImported: false,
          isNew: true
        };
        
        set({
          currentRoute: newRoute,
          isRecordingRoute: true
        });
      },
      
      stopRouteRecording: () => {
        const { currentRoute } = get();
        if (!currentRoute) return null;
        
        const completedRoute: Route = {
          ...currentRoute,
          endTime: Date.now(),
          duration: Date.now() - currentRoute.startTime
        };
        
        set(state => ({
          savedRoutes: [completedRoute, ...state.savedRoutes],
          currentRoute: null,
          isRecordingRoute: false
        }));
        
        return completedRoute;
      },
      
      addRoutePoint: (point) => {
        set(state => {
          if (!state.currentRoute) return {};
          
          const newPoints = [...state.currentRoute.points, point];
          let totalDistance = state.currentRoute.totalDistance;
          
          // Výpočet vzdálenosti od posledního bodu
          if (newPoints.length > 1) {
            const lastPoint = newPoints[newPoints.length - 2];
            const distance = Math.sqrt(
              Math.pow(point.lat - lastPoint.lat, 2) + 
              Math.pow(point.lng - lastPoint.lng, 2)
            ) * 111000; // přibližný převod na metry
            
            totalDistance += distance;
          }
          
          return {
            currentRoute: {
              ...state.currentRoute,
              points: newPoints,
              totalDistance
            }
          };
        });
      },
      
      saveRoute: (route) => {
        set(state => ({
          savedRoutes: [route, ...state.savedRoutes.filter(r => r.id !== route.id)]
        }));
      },
      
      deleteRoute: (routeId) => {
        set(state => ({
          savedRoutes: state.savedRoutes.filter(r => r.id !== routeId)
        }));
      },
      
      shareRoute: (route) => {
        // Pro demo: Vytvořit jednoduchý kód pro sdílení
        const shareCode = btoa(JSON.stringify({
          id: route.id,
          name: route.name,
          points: route.points,
          totalDistance: route.totalDistance,
          duration: route.duration,
          startTime: route.startTime,
          endTime: route.endTime || Date.now()
        }));
        
        return shareCode;
      },
      
      importRoute: async (sharedCode) => {
        try {
          // Simulace zpracování kódu
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Decode a parse kódu
          const routeData = JSON.parse(atob(sharedCode));
          
          const importedRoute: Route = {
            ...routeData,
            id: uuidv4(), // Nové ID, abychom zabránili kolizi
            isImported: true,
            isNew: true
          };
          
          set(state => ({
            savedRoutes: [importedRoute, ...state.savedRoutes]
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to import route:', error);
          return false;
        }
      },
      
      // Notifikace - funkce
      addTeamEvent: (type, memberId, memberName, message) => {
        const newEvent = createTeamEvent(type, memberId, memberName, message);
        
        set(state => ({
          teamEvents: [newEvent, ...state.teamEvents.slice(0, 19)], // Uchováváme max. 20 událostí
          unreadEventsCount: state.unreadEventsCount + 1
        }));
      },
      
      dismissTeamEvent: (eventId) => {
        set(state => ({
          teamEvents: state.teamEvents.filter(e => e.id !== eventId),
          unreadEventsCount: Math.max(
            0, 
            state.unreadEventsCount - (state.teamEvents.find(e => e.id === eventId && !e.read) ? 1 : 0)
          )
        }));
      },
        markAllEventsAsRead: () => {
        set(state => ({
          teamEvents: state.teamEvents.map(e => ({ ...e, read: true })),
          unreadEventsCount: 0
        }));
      },
      
      // Chat funkce
      sendChatMessage: (text) => {
        const state = get();
        
        if (!state.isTeamMode || !text.trim()) return;
        
        // ID aktuálního uživatele je vždy 'current-user'
        const currentUser = state.teamMembers.find(m => m.id === 'current-user');
        const memberName = currentUser?.name || 'Já';
        
        get().addChatMessage('current-user', memberName, text);
      },
      
      addChatMessage: (memberId, memberName, text, isSystem = false) => {
        const newMessage: ChatMessage = {
          id: uuidv4(),
          memberId,
          memberName,
          text,
          timestamp: Date.now(),
          isSystem
        };
        
        set(state => ({
          chatMessages: [...state.chatMessages, newMessage],
          // Zvýšit počet nepřečtených zpráv jen pokud to není zpráva od aktuálního uživatele
          unreadChatCount: state.unreadChatCount + (memberId !== 'current-user' ? 1 : 0)
        }));
      },
      
      markAllChatAsRead: () => {
        set({ unreadChatCount: 0 });
      },
      
      clearChatHistory: () => {
        // Přidá systémovou zprávu o vymazání historie
        const systemMessage: ChatMessage = {
          id: uuidv4(),
          memberId: 'system',
          memberName: 'Systém',
          text: 'Historie chatu byla vymazána',
          timestamp: Date.now(),
          isSystem: true
        };
        
        set({
          chatMessages: [systemMessage],
          unreadChatCount: 0
        });
      },
    }),    {
      name: 'social-store-enhanced',
      partialize: (state) => ({
        friendsList: state.friendsList,
        leaderboard: state.leaderboard,
        savedRoutes: state.savedRoutes,
      }),
    }
  )
);

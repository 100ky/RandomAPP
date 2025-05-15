import { PlayerProgress as GamePlayerProgress, Badge } from './game';

export interface TeamMember {
  id: string;
  name: string;
  avatarId: string;
  isLeader: boolean;
  lastLocation: { lat: number; lng: number } | null;
  isOnline: boolean;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
  avatarId: string;
  achievements: string[];
}

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Route {
  id: string;
  name: string;
  createdAt: number;
  points: RoutePoint[];
  totalDistance: number; // v metrech
  duration: number; // v milisekundách
  isImported?: boolean;
  sharedBy?: string;
}

export interface PlayerProgress extends GamePlayerProgress {
  completedRoutes?: string[];
  friends?: string[];
  teams?: string[];
}

export interface SocialNotification {
  id: string;
  type: 'friend-request' | 'team-invite' | 'achievement' | 'leaderboard';
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

export interface ChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

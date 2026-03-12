export type PlayerId = 1 | 2 | 3 | 4 | 5;
export type Team = 'home' | 'away';

export type ActionType = 'Falta' | 'Robo' | 'Asist' | 'Tapón' | 'Colada' | 'Tiro Libre' | 'Puntos' | 'Rebound' | 'TimeOut';

export interface GameState {
  home: number;
  away: number;
}

export interface MatchEvent {
  playerId: PlayerId;
  team: Team;
  action: ActionType;
  points?: number;
  timestamp: string;
  quarter: number;
}

export interface PlayerStats {
  playerId: PlayerId;
  team: Team;
  fouls: number;
  steals: number;
  assists: number;
  blocks: number;
  rebounds: number;
  pointsScored: number;
}

export interface QuarterStats {
  quarter: number;
  homeScore: number;
  awayScore: number;
  homeEvents: MatchEvent[];
  awayEvents: MatchEvent[];
}

export interface MatchStatistics {
  homeStats: Record<PlayerId, PlayerStats>;
  awayStats: Record<PlayerId, PlayerStats>;
  quarterStats: QuarterStats[];
  totalEvents: number;
}
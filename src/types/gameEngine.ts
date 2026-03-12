/**
 * Complete Type System for RoyaleScore Professional Scouting Platform
 * Supports: 10-player systems (5v5), NBA rules, analytics
 */

// ============ PLAYER & TEAM TYPES ============

export type PlayerId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Team = 'home' | 'away';
export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export interface PlayerStats {
  pointsScored: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  rebounds: number;
  reboundsOffensive: number;
  reboundsDefensive: number;
  assists: number;
  steals: number;
  blocks: number;
  fouls: number;
  turnovers: number;
  plusMinus: number;
}

export interface Player {
  id: string; // UUID
  playerId: PlayerId;
  team: Team;
  jerseyNumber: number;
  position: Position;
  firstName: string;
  lastName: string;
  stats: PlayerStats;
  isActive: boolean;
  timeOnCourtMs: number;
}

export interface TeamData {
  id: string; // UUID
  name: string;
  color: string; // hex color for UI
  players: Player[];
  teamStats: Partial<PlayerStats>;
}

// ============ MATCH & GAME STATE TYPES ============

export type ActionType = 'Falta' | 'Robo' | 'Asist' | 'Tapón' | 'Rebound' | 'Turnover' | 'Timeout' | 'Puntos';
export type PeriodType = 'REGULATION' | 'OVERTIME';

export interface MatchEvent {
  eventId: string; // UUID
  matchId: string;
  playerId: PlayerId;
  team: Team;
  actionType: ActionType;
  actionValue: number; // points, etc
  quarter: number;
  gameClock: {
    minutes: number;
    seconds: number;
    milliseconds?: number;
  };
  gameClockMs: number; // milliseconds into quarter
  timeRecorded: number; // epoch timestamp
  homeScoreAfter: number;
  awayScoreAfter: number;
  undoable: boolean;
}

export interface MatchState {
  matchId: string;
  homeTeam: TeamData;
  awayTeam: TeamData;
  homeScore: number;
  awayScore: number;
  currentQuarter: number;
  periodType: PeriodType;
  overtimeNumber: number; // 1 for OT1, 2 for OT2, etc
  totalOvertimes: number;
  gameStatus: 'pending' | 'in_progress' | 'finished';
  timeLeftMs: number; // milliseconds remaining in quarter/OT
  totalGameTimeMs: number; // total elapsed time since start
  startedAt: Date;
  endedAt?: Date;
  lastEventId?: string;
}

export interface QuarterScore {
  quarter: number;
  periodType: PeriodType;
  overtimeNumber?: number;
  homeScoreInPeriod: number;
  awayScoreInPeriod: number;
  homeFoulsInPeriod: number;
  awayFoulsInPeriod: number;
}

export interface MatchAnalytics {
  quarterScores: QuarterScore[];
  playerStats: Record<PlayerId, Partial<PlayerStats>>; // indexed by player ID
  teamStats: {
    home: Partial<PlayerStats>;
    away: Partial<PlayerStats>;
  };
  trends: {
    homeScoreTrend: number[]; // score per quarter
    awayScoreTrend: number[];
    homeMomentum: number; // positive = gaining, negative = losing
    awayMomentum: number;
  };
  predictions?: {
    winProbability: { home: number; away: number };
    projectedFinalScore: { home: number; away: number };
  };
}

// ============ GAME CONTEXT STATE ============

export interface GameContextType {
  // Match State
  matchState: MatchState;
  analytics: MatchAnalytics;

  // Event Management
  eventLog: MatchEvent[];
  undoStack: MatchEvent[];
  redoStack: MatchEvent[];

  // UI State
  selectedPlayer: { playerId: PlayerId; team: Team } | null;
  activeTeamFocus: Team; // for mobile/tablet toggle
  modalOpen: 'action' | 'score' | 'clock' | null;
  isLoading: boolean;
  error: string | null;

  // Actions / Dispatch Methods
  actions: GameContextActions;
}

export interface GameContextActions {
  // Player Selection
  setSelectedPlayer: (playerId: PlayerId, team: Team) => void;
  clearSelectedPlayer: () => void;
  setActiveTeamFocus: (team: Team) => void;

  // Event Recording & Management
  recordAction: (
    playerId: PlayerId,
    team: Team,
    actionType: ActionType,
    quarter: number,
    gameClockMs: number,
    actionValue?: number
  ) => void;
  undoLastAction: () => void;
  redoLastAction: () => void;
  clearEventLog: () => void;

  // Scoring
  updateScore: (homeScore: number, awayScore: number) => void;
  addScore: (team: Team, points: number) => void;

  // Quarter/Period Management
  nextQuarter: () => void;
  previousQuarter: () => void;
  resetQuarter: () => void;
  resetMatch: () => void;
  addOvertime: () => void;
  skipToQuarter: (quarter: number) => void;

  // Timer Management
  updateTimeLeft: (ms: number) => void;
  toggleGameClock: () => boolean; // returns isPaused

  // Modal Management
  openModal: (modalType: 'action' | 'score' | 'clock') => void;
  closeModal: () => void;

  // State Persistence
  saveMatchToDB: (matchId: string) => Promise<void>;
  loadMatchFromDB: (matchId: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

// ============ API REQUEST/RESPONSE TYPES ============

export interface MatchCreateRequest {
  homeTeamId: string;
  awayTeamId: string;
  homeRoster: Player[];
  awayRoster: Player[];
  leagueId?: string;
}

export interface PlayerActionRequest {
  matchId: string;
  playerId: PlayerId;
  team: Team;
  actionType: ActionType;
  quarter: number;
  gameClockMs: number;
  actionValue?: number;
}

export interface MatchAnalyticsResponse {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  playerStats: Record<PlayerId, Partial<PlayerStats>>;
  teamStats: {
    home: Partial<PlayerStats>;
    away: Partial<PlayerStats>;
  };
  quarterScores: QuarterScore[];
  timeline: MatchEvent[];
  predictions?: {
    winProbability: { home: number; away: number };
    projectedFinalScore: { home: number; away: number };
  };
}

// ============ CONSTANTS ============

export const QUARTER_DURATION_MS = 12 * 60 * 1000; // 12 minutes NBA standard
export const OVERTIME_DURATION_MS = 5 * 60 * 1000; // 5 minutes NBA standard
export const REGULATION_QUARTERS = 4;

export const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  pointsScored: 0,
  fieldGoalsMade: 0,
  fieldGoalsAttempted: 0,
  threePointersMade: 0,
  threePointersAttempted: 0,
  freeThrowsMade: 0,
  freeThrowsAttempted: 0,
  rebounds: 0,
  reboundsOffensive: 0,
  reboundsDefensive: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  fouls: 0,
  turnovers: 0,
  plusMinus: 0,
};

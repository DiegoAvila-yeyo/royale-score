/**
 * GameContext - Centralized state management for RoyaleScore
 * Manages: Match state, Player data, Event log, UI state
 * Provides: State and actions to all consuming components
 */

"use client";

import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import {
  GameContextType,
  GameContextActions,
  MatchState,
  MatchEvent,
  ActionType,
  PlayerId,
  Team,
  PeriodType,
  DEFAULT_PLAYER_STATS,
  QUARTER_DURATION_MS,
  OVERTIME_DURATION_MS,
  REGULATION_QUARTERS,
  MatchAnalytics,
  QuarterScore,
  TeamData,
} from '@/types/gameEngine';
import { gameService } from '@/services/gameService';

// Create Context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider Props
interface GameProviderProps {
  children: React.ReactNode;
  initialMatchId?: string;
}

// ============ GAME PROVIDER COMPONENT ============

export const GameProvider: React.FC<GameProviderProps> = ({ children, initialMatchId }) => {
  // State
  const [matchState, setMatchState] = useState<MatchState>({
    matchId: initialMatchId || '',
    homeTeam: { id: '', name: 'Home', color: '#3B82F6', players: [], teamStats: {} },
    awayTeam: { id: '', name: 'Away', color: '#EF4444', players: [], teamStats: {} },
    homeScore: 0,
    awayScore: 0,
    currentQuarter: 1,
    periodType: 'REGULATION',
    overtimeNumber: 0,
    totalOvertimes: 0,
    gameStatus: 'pending',
    timeLeftMs: QUARTER_DURATION_MS,
    totalGameTimeMs: 0,
    startedAt: new Date(),
  });

  const [eventLog, setEventLog] = useState<MatchEvent[]>([]);
  const [undoStack, setUndoStack] = useState<MatchEvent[]>([]);
  const [redoStack, setRedoStack] = useState<MatchEvent[]>([]);
  const [analytics, setAnalytics] = useState<MatchAnalytics>({
    quarterScores: [],
    playerStats: {
      1: DEFAULT_PLAYER_STATS,
      2: DEFAULT_PLAYER_STATS,
      3: DEFAULT_PLAYER_STATS,
      4: DEFAULT_PLAYER_STATS,
      5: DEFAULT_PLAYER_STATS,
      6: DEFAULT_PLAYER_STATS,
      7: DEFAULT_PLAYER_STATS,
      8: DEFAULT_PLAYER_STATS,
      9: DEFAULT_PLAYER_STATS,
      10: DEFAULT_PLAYER_STATS,
    },
    teamStats: { home: DEFAULT_PLAYER_STATS, away: DEFAULT_PLAYER_STATS },
    trends: {
      homeScoreTrend: [0],
      awayScoreTrend: [0],
      homeMomentum: 0,
      awayMomentum: 0,
    },
  });

  const [selectedPlayer, setSelectedPlayerState] = useState<{ playerId: PlayerId; team: Team } | null>(null);
  const [activeTeamFocus, setActiveTeamFocus] = useState<Team>('home');
  const [modalOpen, setModalOpen] = useState<'action' | 'score' | 'clock' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventIdCounter = useRef(0);
  const isGameClockRunning = useRef(false);

  // ============ ACTION IMPLEMENTATIONS ============

  // Player Selection
  const setSelectedPlayer = useCallback((playerId: PlayerId, team: Team) => {
    setSelectedPlayerState({ playerId, team });
    setModalOpen('action'); // Auto-open action modal
  }, []);

  const clearSelectedPlayer = useCallback(() => {
    setSelectedPlayerState(null);
  }, []);

  // Event Recording
  const recordAction = useCallback(
    (
      playerId: PlayerId,
      team: Team,
      actionType: ActionType,
      quarter: number,
      gameClockMs: number,
      actionValue: number = 0
    ) => {
      const newEvent: MatchEvent = {
        eventId: `evt_${eventIdCounter.current++}`,
        matchId: matchState.matchId,
        playerId,
        team,
        actionType,
        actionValue,
        quarter,
        gameClock: {
          minutes: Math.floor(gameClockMs / 60000),
          seconds: Math.floor((gameClockMs % 60000) / 1000),
        },
        gameClockMs,
        timeRecorded: Date.now(),
        homeScoreAfter: actionType === 'Puntos' && team === 'home' ? matchState.homeScore + actionValue : matchState.homeScore,
        awayScoreAfter: actionType === 'Puntos' && team === 'away' ? matchState.awayScore + actionValue : matchState.awayScore,
        undoable: true,
      };

      // Update scores if it's a scoring action
      if (actionType === 'Puntos') {
        setMatchState((prev) => ({
          ...prev,
          homeScore: team === 'home' ? prev.homeScore + actionValue : prev.homeScore,
          awayScore: team === 'away' ? prev.awayScore + actionValue : prev.awayScore,
        }));
      }

      // Add to event log
      setEventLog((prev) => [...prev, newEvent]);
      setUndoStack((prev) => [...prev, newEvent]);
      setRedoStack([]); // Clear redo stack when new action recorded

      // Persist to backend immediately
      gameService.recordPlayerAction({
        match_id: matchState.matchId,
        player_id: playerId,
        team,
        action_type: actionType,
        points: actionValue,
        quarter,
      }).catch(err => {
        console.error('Failed to persist action:', err);
        setError('Failed to save action to server');
      });

      // Clear modal and selection
      setModalOpen(null);
      clearSelectedPlayer();
    },
    [matchState.matchId, matchState.homeScore, matchState.awayScore, clearSelectedPlayer]
  );

  // Undo/Redo
  const undoLastAction = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastEvent = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, lastEvent]);
    setUndoStack((prev) => prev.slice(0, -1));
    setEventLog((prev) => prev.filter((e) => e.eventId !== lastEvent.eventId));

    // Revert score if it was a scoring action
    if (lastEvent.actionType === 'Puntos') {
      setMatchState((prev) => ({
        ...prev,
        homeScore: lastEvent.team === 'home' ? prev.homeScore - lastEvent.actionValue : prev.homeScore,
        awayScore: lastEvent.team === 'away' ? prev.awayScore - lastEvent.actionValue : prev.awayScore,
      }));
    }

    // TODO: Sync undo with backend
  }, []);

  const redoLastAction = useCallback(() => {
    if (redoStack.length === 0) return;

    const eventToRedo = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, eventToRedo]);
    setRedoStack((prev) => prev.slice(0, -1));
    setEventLog((prev) => [...prev, eventToRedo]);

    // Re-apply score if scoring action
    if (eventToRedo.actionType === 'Puntos') {
      setMatchState((prev) => ({
        ...prev,
        homeScore: eventToRedo.team === 'home' ? prev.homeScore + eventToRedo.actionValue : prev.homeScore,
        awayScore: eventToRedo.team === 'away' ? prev.awayScore + eventToRedo.actionValue : prev.awayScore,
      }));
    }

    // TODO: Sync redo with backend
  }, []);

  const clearEventLog = useCallback(() => {
    setEventLog([]);
    setUndoStack([]);
    setRedoStack([]);
    eventIdCounter.current = 0;
  }, []);

  // Scoring
  const updateScore = useCallback((homeScore: number, awayScore: number) => {
    setMatchState((prev) => ({
      ...prev,
      homeScore,
      awayScore,
    }));
  }, []);

  const addScore = useCallback((team: Team, points: number) => {
    setMatchState((prev) => ({
      ...prev,
      homeScore: team === 'home' ? prev.homeScore + points : prev.homeScore,
      awayScore: team === 'away' ? prev.awayScore + points : prev.awayScore,
    }));
  }, []);

  // Quarter/Period Management
  const nextQuarter = useCallback(() => {
    setMatchState((prev) => {
      if (prev.periodType === 'REGULATION' && prev.currentQuarter < REGULATION_QUARTERS) {
        return {
          ...prev,
          currentQuarter: prev.currentQuarter + 1,
          timeLeftMs: QUARTER_DURATION_MS,
        };
      } else if (prev.periodType === 'REGULATION' && prev.currentQuarter === REGULATION_QUARTERS) {
        // Check for tie -> potentially go to OT (handled separately)
        return prev;
      } else if (prev.periodType === 'OVERTIME') {
        // Continue OT
        return {
          ...prev,
          overtimeNumber: prev.overtimeNumber + 1,
          totalOvertimes: prev.totalOvertimes + 1,
          timeLeftMs: OVERTIME_DURATION_MS,
        };
      }
      return prev;
    });
  }, []);

  const previousQuarter = useCallback(() => {
    setMatchState((prev) => {
      if (prev.periodType === 'REGULATION' && prev.currentQuarter > 1) {
        return {
          ...prev,
          currentQuarter: prev.currentQuarter - 1,
          timeLeftMs: QUARTER_DURATION_MS,
        };
      }
      return prev;
    });
  }, []);

  const resetQuarter = useCallback(() => {
    setMatchState((prev) => ({
      ...prev,
      timeLeftMs: prev.periodType === 'REGULATION' ? QUARTER_DURATION_MS : OVERTIME_DURATION_MS,
    }));
  }, []);

  const resetMatch = useCallback(() => {
    setMatchState((prev) => ({
      ...prev,
      homeScore: 0,
      awayScore: 0,
      currentQuarter: 1,
      periodType: 'REGULATION',
      overtimeNumber: 0,
      totalOvertimes: 0,
      timeLeftMs: QUARTER_DURATION_MS,
      totalGameTimeMs: 0,
      gameStatus: 'pending',
    }));
    clearEventLog();
  }, [clearEventLog]);

  const addOvertime = useCallback(() => {
    setMatchState((prev) => ({
      ...prev,
      periodType: 'OVERTIME',
      overtimeNumber: 1,
      totalOvertimes: 1,
      timeLeftMs: OVERTIME_DURATION_MS,
      gameStatus: 'in_progress',
    }));
  }, []);

  const skipToQuarter = useCallback((quarter: number) => {
    setMatchState((prev) => ({
      ...prev,
      currentQuarter: Math.min(quarter, REGULATION_QUARTERS),
      timeLeftMs: QUARTER_DURATION_MS,
    }));
  }, []);

  // Timer Management
  const updateTimeLeft = useCallback((ms: number) => {
    setMatchState((prev) => ({
      ...prev,
      timeLeftMs: Math.max(0, ms),
      totalGameTimeMs: prev.totalGameTimeMs + (prev.timeLeftMs - Math.max(0, ms)),
    }));
  }, []);

  const toggleGameClock = useCallback(() => {
    isGameClockRunning.current = !isGameClockRunning.current;
    return isGameClockRunning.current;
  }, []);

  // Modal Management
  const openModal = useCallback((modalType: 'action' | 'score' | 'clock') => {
    setModalOpen(modalType);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(null);
  }, []);

  // Persistence
  const saveMatchToDB = useCallback(async (matchId: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement backend persistence
      console.log('Saving match to DB:', matchId);
      setIsLoading(false);
    } catch (err) {
      setError(String(err));
      setIsLoading(false);
    }
  }, []);

  const loadMatchFromDB = useCallback(async (matchId: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement backend loading
      console.log('Loading match from DB:', matchId);
      setIsLoading(false);
    } catch (err) {
      setError(String(err));
      setIsLoading(false);
    }
  }, []);

  const syncWithBackend = useCallback(async () => {
    try {
      // TODO: Sync match state with backend
      console.log('Syncing with backend:', matchState.matchId);
    } catch (err) {
      setError(String(err));
    }
  }, [matchState.matchId]);

  // ============ CONTEXT VALUE ============

  const actions: GameContextActions = {
    setSelectedPlayer,
    clearSelectedPlayer,
    setActiveTeamFocus,
    recordAction,
    undoLastAction,
    redoLastAction,
    clearEventLog,
    updateScore,
    addScore,
    nextQuarter,
    previousQuarter,
    resetQuarter,
    resetMatch,
    addOvertime,
    skipToQuarter,
    updateTimeLeft,
    toggleGameClock,
    openModal,
    closeModal,
    saveMatchToDB,
    loadMatchFromDB,
    syncWithBackend,
  };

  const value: GameContextType = {
    matchState,
    analytics,
    eventLog,
    undoStack,
    redoStack,
    selectedPlayer,
    activeTeamFocus,
    modalOpen,
    isLoading,
    error,
    actions,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// ============ CUSTOM HOOKS ============

/**
 * Main hook to access entire GameContext
 */
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
};

/**
 * Hook to access only match state
 */
export const useMatch = () => {
  const { matchState, actions } = useGameContext();
  return { matchState, actions };
};

/**
 * Hook to access only players/teams
 */
export const usePlayers = () => {
  const { matchState } = useGameContext();
  return {
    homeTeam: matchState.homeTeam,
    awayTeam: matchState.awayTeam,
  };
};

/**
 * Hook to access only event log
 */
export const useEventLog = () => {
  const { eventLog, undoStack, redoStack, actions } = useGameContext();
  return {
    events: eventLog,
    undoStack,
    redoStack,
    recordAction: actions.recordAction,
    undoLastAction: actions.undoLastAction,
    redoLastAction: actions.redoLastAction,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
};

/**
 * Hook to access UI state
 */
export const useUIState = () => {
  const { selectedPlayer, activeTeamFocus, modalOpen, actions } = useGameContext();
  return {
    selectedPlayer,
    activeTeamFocus,
    modalOpen,
    setSelectedPlayer: actions.setSelectedPlayer,
    clearSelectedPlayer: actions.clearSelectedPlayer,
    setActiveTeamFocus: actions.setActiveTeamFocus,
    openModal: actions.openModal,
    closeModal: actions.closeModal,
  };
};

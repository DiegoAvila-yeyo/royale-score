/**
 * GameContext — Centralized state for RoyaleScore
 * Manages: Match state, Event log, UI state
 */
"use client";

import React, {
  createContext, useContext, useCallback, useState, useRef, useEffect, memo,
} from 'react';
import {
  GameContextType, GameContextActions, MatchState, MatchEvent,
  ActionType, PlayerId, Team, PeriodType,
  DEFAULT_PLAYER_STATS, QUARTER_DURATION_MS, OVERTIME_DURATION_MS,
  REGULATION_QUARTERS, MatchAnalytics, QuarterScore, TeamData,
} from '@/types/gameEngine';
import { gameService } from '@/services/gameService';

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: React.ReactNode;
  initialMatchId?: string;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, initialMatchId }) => {
  const [matchState, setMatchState] = useState<MatchState>({
    matchId: initialMatchId || '',
    homeTeam: { id: '', name: 'Home', color: '#3B82F6', players: [], teamStats: {} },
    awayTeam: { id: '', name: 'Away', color: '#EF4444', players: [], teamStats: {} },
    homeScore: 0, awayScore: 0,
    currentQuarter: 1, periodType: 'REGULATION',
    overtimeNumber: 0, totalOvertimes: 0,
    gameStatus: 'pending',
    timeLeftMs: QUARTER_DURATION_MS, totalGameTimeMs: 0,
    startedAt: new Date(),
  });

  const [eventLog, setEventLog] = useState<MatchEvent[]>([]);
  const [undoStack, setUndoStack] = useState<MatchEvent[]>([]);
  const [redoStack, setRedoStack] = useState<MatchEvent[]>([]);
  const [analytics] = useState<MatchAnalytics>({
    quarterScores: [],
    playerStats: {
      1: DEFAULT_PLAYER_STATS, 2: DEFAULT_PLAYER_STATS, 3: DEFAULT_PLAYER_STATS,
      4: DEFAULT_PLAYER_STATS, 5: DEFAULT_PLAYER_STATS, 6: DEFAULT_PLAYER_STATS,
      7: DEFAULT_PLAYER_STATS, 8: DEFAULT_PLAYER_STATS, 9: DEFAULT_PLAYER_STATS,
      10: DEFAULT_PLAYER_STATS,
    },
    teamStats: { home: DEFAULT_PLAYER_STATS, away: DEFAULT_PLAYER_STATS },
    trends: { homeScoreTrend: [0], awayScoreTrend: [0], homeMomentum: 0, awayMomentum: 0 },
  });

  const [selectedPlayer, setSelectedPlayerState] = useState<{ playerId: PlayerId; team: Team } | null>(null);
  const [activeTeamFocus, setActiveTeamFocus] = useState<Team>('home');
  const [modalOpen, setModalOpen] = useState<'action' | 'score' | 'clock' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventIdCounter = useRef(0);

  // ── Ref mirror: always holds the latest matchState without closure staleness ──
  const matchStateRef = useRef(matchState);
  useEffect(() => { matchStateRef.current = matchState; });

  // ── Player Selection ──────────────────────────────────────────────────────────

  const setSelectedPlayer = useCallback((playerId: PlayerId, team: Team) => {
    setSelectedPlayerState({ playerId, team });
    setModalOpen('action');
  }, []);

  const clearSelectedPlayer = useCallback(() => {
    setSelectedPlayerState(null);
  }, []);

  // ── Event Recording ───────────────────────────────────────────────────────────

  const recordAction = useCallback(
    (
      playerId: PlayerId,
      team: Team,
      actionType: ActionType,
      quarter: number,
      gameClockMs: number,
      actionValue = 0,
    ) => {
      const current = matchStateRef.current;

      // Compute scores-after using current (not stale closure) values
      const newHomeScore = actionType === 'Puntos' && team === 'home'
        ? current.homeScore + actionValue : current.homeScore;
      const newAwayScore = actionType === 'Puntos' && team === 'away'
        ? current.awayScore + actionValue : current.awayScore;

      const newEvent: MatchEvent = {
        eventId: `evt_${eventIdCounter.current++}`,
        matchId: current.matchId,
        playerId, team, actionType, actionValue, quarter,
        gameClock: {
          minutes: Math.floor(gameClockMs / 60000),
          seconds: Math.floor((gameClockMs % 60000) / 1000),
        },
        gameClockMs,
        timeRecorded: Date.now(),
        homeScoreAfter: newHomeScore,
        awayScoreAfter: newAwayScore,
        undoable: true,
      };

      setEventLog((prev) => [...prev, newEvent]);
      setUndoStack((prev) => [...prev, newEvent]);
      setRedoStack([]);

      if (actionType === 'Puntos') {
        setMatchState((prev) => ({
          ...prev,
          homeScore: team === 'home' ? prev.homeScore + actionValue : prev.homeScore,
          awayScore: team === 'away' ? prev.awayScore + actionValue : prev.awayScore,
        }));
      }

      gameService.recordPlayerAction({
        match_id: current.matchId,
        player_id: playerId,
        team,
        action_type: actionType,
        points: actionValue,
        quarter,
        game_clock_ms: gameClockMs,
      }).catch(() => setError('Failed to save action to server'));

      setModalOpen(null);
      clearSelectedPlayer();
    },
    [clearSelectedPlayer], // ← minimal deps; matchStateRef always current
  );

  // ── Undo / Redo ──────────────────────────────────────────────────────────────

  const undoLastAction = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, last]);
    setUndoStack((prev) => prev.slice(0, -1));
    setEventLog((prev) => prev.filter((e) => e.eventId !== last.eventId));
    if (last.actionType === 'Puntos') {
      setMatchState((prev) => ({
        ...prev,
        homeScore: last.team === 'home' ? prev.homeScore - last.actionValue : prev.homeScore,
        awayScore: last.team === 'away' ? prev.awayScore - last.actionValue : prev.awayScore,
      }));
    }
  }, [undoStack]);

  const redoLastAction = useCallback(() => {
    if (redoStack.length === 0) return;
    const evt = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, evt]);
    setRedoStack((prev) => prev.slice(0, -1));
    setEventLog((prev) => [...prev, evt]);
    if (evt.actionType === 'Puntos') {
      setMatchState((prev) => ({
        ...prev,
        homeScore: evt.team === 'home' ? prev.homeScore + evt.actionValue : prev.homeScore,
        awayScore: evt.team === 'away' ? prev.awayScore + evt.actionValue : prev.awayScore,
      }));
    }
  }, [redoStack]);

  const clearEventLog = useCallback(() => {
    setEventLog([]); setUndoStack([]); setRedoStack([]);
    eventIdCounter.current = 0;
  }, []);

  // ── Scoring ───────────────────────────────────────────────────────────────────

  const updateScore = useCallback((homeScore: number, awayScore: number) => {
    setMatchState((prev) => ({ ...prev, homeScore, awayScore }));
  }, []);

  const addScore = useCallback((team: Team, points: number) => {
    setMatchState((prev) => ({
      ...prev,
      homeScore: team === 'home' ? prev.homeScore + points : prev.homeScore,
      awayScore: team === 'away' ? prev.awayScore + points : prev.awayScore,
    }));
  }, []);

  // ── Quarter / Period Management ───────────────────────────────────────────────

  const nextQuarter = useCallback(() => {
    setMatchState((prev) => {
      if (prev.periodType === 'REGULATION' && prev.currentQuarter < REGULATION_QUARTERS) {
        return { ...prev, currentQuarter: prev.currentQuarter + 1, timeLeftMs: QUARTER_DURATION_MS };
      }
      if (prev.periodType === 'OVERTIME') {
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
    setMatchState((prev) =>
      prev.periodType === 'REGULATION' && prev.currentQuarter > 1
        ? { ...prev, currentQuarter: prev.currentQuarter - 1, timeLeftMs: QUARTER_DURATION_MS }
        : prev,
    );
  }, []);

  const resetQuarter = useCallback(() => {
    setMatchState((prev) => ({
      ...prev,
      timeLeftMs: prev.periodType === 'REGULATION' ? QUARTER_DURATION_MS : OVERTIME_DURATION_MS,
    }));
  }, []);

  const resetMatch = useCallback(() => {
    setMatchState((prev) => ({
      ...prev, homeScore: 0, awayScore: 0,
      currentQuarter: 1, periodType: 'REGULATION',
      overtimeNumber: 0, totalOvertimes: 0,
      timeLeftMs: QUARTER_DURATION_MS, totalGameTimeMs: 0, gameStatus: 'pending',
    }));
    clearEventLog();
  }, [clearEventLog]);

  const addOvertime = useCallback(() => {
    setMatchState((prev) => ({
      ...prev, periodType: 'OVERTIME', overtimeNumber: 1,
      totalOvertimes: 1, timeLeftMs: OVERTIME_DURATION_MS, gameStatus: 'in_progress',
    }));
  }, []);

  const skipToQuarter = useCallback((quarter: number) => {
    setMatchState((prev) => ({
      ...prev, currentQuarter: Math.min(quarter, REGULATION_QUARTERS), timeLeftMs: QUARTER_DURATION_MS,
    }));
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────────────

  const updateTimeLeft = useCallback((ms: number) => {
    setMatchState((prev) => ({
      ...prev,
      timeLeftMs: Math.max(0, ms),
      totalGameTimeMs: prev.totalGameTimeMs + Math.max(0, prev.timeLeftMs - Math.max(0, ms)),
    }));
  }, []);

  const toggleGameClock = useCallback(() => false, []);

  // ── Modal ─────────────────────────────────────────────────────────────────────

  const openModal = useCallback((type: 'action' | 'score' | 'clock') => setModalOpen(type), []);
  const closeModal = useCallback(() => setModalOpen(null), []);

  // ── Persistence (stubbed — backend sync via gameService queue) ────────────────

  const saveMatchToDB = useCallback(async (_matchId: string) => {
    setIsLoading(true);
    setIsLoading(false);
  }, []);

  const loadMatchFromDB = useCallback(async (_matchId: string) => {
    setIsLoading(true);
    setIsLoading(false);
  }, []);

  const syncWithBackend = useCallback(async () => {
    // Handled by gameService offline queue
  }, []);

  // ── Context Value ─────────────────────────────────────────────────────────────

  const actions: GameContextActions = {
    setSelectedPlayer, clearSelectedPlayer, setActiveTeamFocus,
    recordAction,
    undoLastAction, redoLastAction, clearEventLog,
    updateScore, addScore,
    nextQuarter, previousQuarter, resetQuarter, resetMatch, addOvertime, skipToQuarter,
    updateTimeLeft, toggleGameClock,
    openModal, closeModal,
    saveMatchToDB, loadMatchFromDB, syncWithBackend,
  };

  return (
    <GameContext.Provider value={{
      matchState, analytics, eventLog, undoStack, redoStack,
      selectedPlayer, activeTeamFocus, modalOpen, isLoading, error, actions,
    }}>
      {children}
    </GameContext.Provider>
  );
};

// ── Custom Hooks ──────────────────────────────────────────────────────────────

export const useGameContext = (): GameContextType => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be within GameProvider');
  return ctx;
};

export const useMatch = () => {
  const { matchState, actions } = useGameContext();
  return { matchState, actions };
};

export const usePlayers = () => {
  const { matchState } = useGameContext();
  return { homeTeam: matchState.homeTeam, awayTeam: matchState.awayTeam };
};

export const useEventLog = () => {
  const { eventLog, undoStack, redoStack, actions } = useGameContext();
  return {
    events: eventLog, undoStack, redoStack,
    recordAction: actions.recordAction,
    undoLastAction: actions.undoLastAction,
    redoLastAction: actions.redoLastAction,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
};

export const useUIState = () => {
  const { selectedPlayer, activeTeamFocus, modalOpen, actions } = useGameContext();
  return {
    selectedPlayer, activeTeamFocus, modalOpen,
    setSelectedPlayer: actions.setSelectedPlayer,
    clearSelectedPlayer: actions.clearSelectedPlayer,
    setActiveTeamFocus: actions.setActiveTeamFocus,
    openModal: actions.openModal,
    closeModal: actions.closeModal,
  };
};

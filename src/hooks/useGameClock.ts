"use client";
/**
 * useGameClock — NBA quarter clock with LOCAL state optimisation.
 *
 * Key design: the 100ms countdown lives entirely in hook-local state.
 * GameContext.matchState.timeLeftMs is only updated at discrete boundaries
 * (pause, reset, quarter end), preventing ~600 re-renders per minute.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameContext } from '@/context/GameContext';
import { QUARTER_DURATION_MS, OVERTIME_DURATION_MS } from '@/types/gameEngine';

export interface UseGameClockReturn {
  timeLeft: string;
  timeLeftMs: number;
  quarter: number;
  overtimeNumber: number;
  periodType: 'REGULATION' | 'OVERTIME';
  isRunning: boolean;
  isPaused: boolean;
  toggleClock: () => void;
  resetQuarter: () => void;
  resetMatch: () => void;
  nextQuarter: () => void;
  previousQuarter: () => void;
  addOvertime: () => void;
  skipToQuarter: (quarter: number) => void;
  /** Live ms value — use when recording events for precise timestamps. */
  getGameClockMs: () => number;
}

const fmt = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const useGameClock = (): UseGameClockReturn => {
  const { matchState, actions } = useGameContext();

  const [isRunning, setIsRunning] = useState(false);
  // Local display state — ticks without touching GameContext
  const [localMs, setLocalMs] = useState(matchState.timeLeftMs);
  const localMsRef = useRef(localMs);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref mirror of matchState for use inside intervals (avoids stale closure)
  const matchStateRef = useRef(matchState);
  useEffect(() => { matchStateRef.current = matchState; });

  // ── Sync local clock FROM context when NOT running ────────────────────────
  // This fires when resetQuarter / resetMatch / addOvertime updates timeLeftMs.
  useEffect(() => {
    if (!isRunning) {
      setLocalMs(matchState.timeLeftMs);
      localMsRef.current = matchState.timeLeftMs;
    }
  }, [matchState.timeLeftMs, isRunning]);

  // ── 100ms ticker — only updates local state ────────────────────────────────
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }

    timerRef.current = setInterval(() => {
      const next = Math.max(0, localMsRef.current - 100);
      localMsRef.current = next;
      setLocalMs(next);

      if (next === 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setIsRunning(false);

        // Sync boundary to context
        actions.updateTimeLeft(0);

        // Auto-advance period
        const { periodType, currentQuarter, homeScore, awayScore } = matchStateRef.current;
        if (periodType === 'REGULATION' && currentQuarter < 4) {
          actions.nextQuarter();
        } else if (periodType === 'REGULATION' && currentQuarter === 4 && homeScore === awayScore) {
          actions.addOvertime();
        }
      }
    }, 100);

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [isRunning, actions]);

  // ── Controls ───────────────────────────────────────────────────────────────

  const toggleClock = useCallback(() => {
    setIsRunning((prev) => {
      if (prev) {
        // Pause: sync current local time to context
        actions.updateTimeLeft(localMsRef.current);
      }
      return !prev;
    });
  }, [actions]);

  const resetQuarter = useCallback(() => {
    setIsRunning(false);
    actions.resetQuarter(); // updates matchState.timeLeftMs → triggers sync useEffect above
  }, [actions]);

  const resetMatch = useCallback(() => {
    setIsRunning(false);
    actions.resetMatch();
  }, [actions]);

  const nextQuarter = useCallback(() => {
    setIsRunning(false);
    actions.nextQuarter();
  }, [actions]);

  const previousQuarter = useCallback(() => {
    setIsRunning(false);
    actions.previousQuarter();
  }, [actions]);

  const addOvertime = useCallback(() => {
    setIsRunning(false);
    actions.addOvertime();
  }, [actions]);

  const skipToQuarter = useCallback((q: number) => {
    setIsRunning(false);
    actions.skipToQuarter(q);
  }, [actions]);

  return {
    timeLeft: fmt(localMs),
    timeLeftMs: localMs,
    quarter: matchState.currentQuarter,
    overtimeNumber: matchState.overtimeNumber,
    periodType: matchState.periodType,
    isRunning,
    isPaused: !isRunning,
    toggleClock,
    resetQuarter,
    resetMatch,
    nextQuarter,
    previousQuarter,
    addOvertime,
    skipToQuarter,
    getGameClockMs: () => localMsRef.current,
  };
};

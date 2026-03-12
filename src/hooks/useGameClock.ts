"use client";

/**
 * useGameClock - Enhanced game clock with NBA rules
 * Features:
 * - 12-minute quarters (NBA standard)
 * - 5-minute overtimes
 * - Auto-quarter advancement
 * - Quarter-level time management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameContext } from '@/context/GameContext';
import { QUARTER_DURATION_MS, OVERTIME_DURATION_MS } from '@/types/gameEngine';

interface UseGameClockReturn {
  timeLeft: string;
  timeLeftMs: number;
  quarter: number;
  overtimeNumber: number;
  periodType: 'REGULATION' | 'OVERTIME';
  displayText: string;
  isRunning: boolean;
  isPaused: boolean;
  toggleClock: () => void;
  resetQuarter: () => void;
  resetMatch: () => void;
  nextQuarter: () => void;
  previousQuarter: () => void;
  addOvertime: () => void;
  skipToQuarter: (quarter: number) => void;
}

export const useGameClock = (): UseGameClockReturn => {
  const { matchState, actions } = useGameContext();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const timeLeftMs = matchState.timeLeftMs;
  const quarter = matchState.currentQuarter;
  const overtimeNumber = matchState.overtimeNumber;
  const periodType = matchState.periodType;

  // Format time as MM:SS
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Display text (e.g., "12:34 Q3" or "04:12 OT2")
  const displayText = `${formatTime(timeLeftMs)} ${periodType === 'REGULATION' ? `Q${quarter}` : `OT${overtimeNumber}`}`;

  // Check if time expired and auto-advance
  useEffect(() => {
    if (timeLeftMs === 0 && isRunning) {
      setIsRunning(false);
      setIsPaused(true);

      // Auto-advance logic
      if (periodType === 'REGULATION' && quarter < 4) {
        // Go to next quarter
        actions.nextQuarter();
      } else if (periodType === 'REGULATION' && quarter === 4 && matchState.homeScore === matchState.awayScore) {
        // Tie at end of regulation -> Overtime
        actions.addOvertime();
      } else if (periodType === 'OVERTIME') {
        // Continue to next overtime (will be handled by GameContext)
        // Manual advancement required if tied
      }
    }
  }, [timeLeftMs, isRunning, periodType, quarter, matchState.homeScore, matchState.awayScore, actions]);

  // Game clock ticker
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      actions.updateTimeLeft(timeLeftMs - 100); // Decrement by 100ms for smooth countdown
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeftMs, actions]);

  // Toggle Clock Start/Pause
  const toggleClock = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsRunning(false);
      setIsPaused(true);
    }
  }, [isRunning]);

  // Reset Quarter
  const resetQuarterLocal = useCallback(() => {
    actions.resetQuarter();
    setIsRunning(false);
    setIsPaused(true);
  }, [actions]);

  // Reset Match
  const resetMatchLocal = useCallback(() => {
    actions.resetMatch();
    setIsRunning(false);
    setIsPaused(true);
  }, [actions]);

  // Next Quarter
  const nextQuarterLocal = useCallback(() => {
    actions.nextQuarter();
    setIsRunning(false);
    setIsPaused(true);
  }, [actions]);

  // Previous Quarter
  const previousQuarterLocal = useCallback(() => {
    actions.previousQuarter();
    setIsRunning(false);
    setIsPaused(true);
  }, [actions]);

  // Add Overtime
  const addOvertimeLocal = useCallback(() => {
    actions.addOvertime();
    setIsRunning(false);
    setIsPaused(true);
  }, [actions]);

  // Skip to Quarter
  const skipToQuarterLocal = useCallback((q: number) => {
    actions.skipToQuarter(q);
    setIsRunning(false);
    setIsPaused(true);
  }, [actions]);

  return {
    timeLeft: formatTime(timeLeftMs),
    timeLeftMs,
    quarter,
    overtimeNumber,
    periodType,
    displayText,
    isRunning,
    isPaused,
    toggleClock,
    resetQuarter: resetQuarterLocal,
    resetMatch: resetMatchLocal,
    nextQuarter: nextQuarterLocal,
    previousQuarter: previousQuarterLocal,
    addOvertime: addOvertimeLocal,
    skipToQuarter: skipToQuarterLocal,
  };
};

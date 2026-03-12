// src/hooks/useScoring.ts
import { useState, useCallback } from 'react';

export interface ScoreAction {
  team: 'home' | 'away';
  points: number;
  timestamp: number;
}

export const useScoring = () => {
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [history, setHistory] = useState<{ home: number; away: number }[]>([]);
  const [actions, setActions] = useState<ScoreAction[]>([]);

  const addScore = useCallback((team: 'home' | 'away', pts: number) => {
    setHistory(prev => [...prev, { ...score }]);
    setScore(prev => ({ ...prev, [team]: prev[team] + pts }));
    setActions(prev => [...prev, { team, points: pts, timestamp: Date.now() }]);
  }, [score]);

  const undoLastScore = useCallback(() => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setScore(lastState);
    setHistory(prev => prev.slice(0, -1));
    setActions(prev => prev.slice(0, -1));
  }, [history]);

  const resetScore = useCallback(() => {
    setScore({ home: 0, away: 0 });
    setHistory([]);
    setActions([]);
  }, []);

  return {
    score,
    addScore,
    undoLastScore,
    resetScore,
    canUndo: history.length > 0,
    actions,
    scoreDifference: score.home - score.away
  };
};
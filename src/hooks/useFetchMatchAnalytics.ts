'use client';

import { useState, useEffect } from 'react';
import { gameService } from '@/services/gameService';

interface MatchAnalytics {
  playerStats: Array<{
    playerId: string;
    team: 'home' | 'away';
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    fouls: number;
  }>;
  teamStats: {
    home: {
      fgPct: number;
      fg3pPct: number;
      ftPct: number;
      totalRebounds: number;
      totalAssists: number;
    };
    away: {
      fgPct: number;
      fg3pPct: number;
      ftPct: number;
      totalRebounds: number;
      totalAssists: number;
    };
  };
  quarterScores: Array<{
    quarter: number;
    homeScore: number;
    awayScore: number;
  }>;
  timeline: Array<{
    timestamp: number;
    event: string;
    playerId?: string;
    actionType?: string;
  }>;
}

interface UseFetchMatchAnalyticsReturn {
  analytics: MatchAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetchMatchAnalytics = (
  matchId: string | null,
  pollingIntervalMs: number = 30000
): UseFetchMatchAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<MatchAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!matchId) {
      setAnalytics(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await gameService.getMatchAnalytics(matchId);
      if (data) {
        setAnalytics(data);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (matchId) {
      fetchAnalytics();
    }
  }, [matchId]);

  // Polling
  useEffect(() => {
    if (!matchId) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, pollingIntervalMs);

    return () => clearInterval(interval);
  }, [matchId, pollingIntervalMs]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

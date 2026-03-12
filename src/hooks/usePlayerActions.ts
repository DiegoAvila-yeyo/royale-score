import { useCallback } from 'react';
import { useGameContext, useUIState } from '@/context/GameContext';
import { PlayerId, Team, ActionType } from '@/types/gameEngine';

/**
 * Encapsulates player selection + action recording in a single hook.
 * Replaces the defunct useCourtActions.ts.
 */
export const usePlayerActions = () => {
  const { matchState, actions } = useGameContext();
  const { selectedPlayer, setSelectedPlayer, clearSelectedPlayer } = useUIState();

  const selectPlayer = useCallback(
    (playerId: PlayerId, team: Team) => {
      setSelectedPlayer(playerId, team);
    },
    [setSelectedPlayer],
  );

  const recordAction = useCallback(
    (
      playerId: PlayerId,
      team: Team,
      actionType: ActionType,
      actionValue = 0,
      gameClockMs?: number,
    ) => {
      actions.recordAction(
        playerId,
        team,
        actionType,
        matchState.currentQuarter,
        gameClockMs ?? matchState.timeLeftMs,
        actionValue,
      );
    },
    [actions, matchState.currentQuarter, matchState.timeLeftMs],
  );

  return {
    selectedPlayer,
    selectPlayer,
    clearSelectedPlayer,
    recordAction,
  };
};

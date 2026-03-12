import { useState } from 'react';
import { PlayerId, ActionType } from '@/types/game';

type ActionCallback = (playerId: PlayerId, action: ActionType) => void;

export const useCourtActions = (onActionRecord: ActionCallback) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerId | null>(null);

  const triggerAction = (action: ActionType) => {
    if (selectedPlayer) {
      onActionRecord(selectedPlayer, action);
      setSelectedPlayer(null); // Reset tras la acción
    }
  };

  return { selectedPlayer, setSelectedPlayer, triggerAction };
};
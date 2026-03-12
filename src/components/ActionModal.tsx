'use client';
import React from 'react';
import { useGameContext, useUIState } from '@/context/GameContext';
import { useGameClock } from '@/hooks/useGameClock';
import { ActionGrid } from '@/components/molecules/ActionGrid';
import { ActionType } from '@/types/gameEngine';
import { X } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Fired after an action is recorded — use to show a Toast. */
  onActionRecorded?: (actionLabel: string, playerNum: number, team: 'home' | 'away') => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, onActionRecorded }) => {
  const { selectedPlayer } = useUIState();
  const { matchState, actions } = useGameContext();
  const { getGameClockMs } = useGameClock();

  if (!isOpen || !selectedPlayer) return null;

  const handleAction = (actionType: ActionType, actionLabel: string) => {
    actions.recordAction(
      selectedPlayer.playerId,
      selectedPlayer.team,
      actionType,
      matchState.currentQuarter,
      getGameClockMs(), // precise live clock, not stale matchState
      0,
    );
    onActionRecorded?.(actionLabel, selectedPlayer.playerId, selectedPlayer.team);
    onClose();
  };

  const isHome = selectedPlayer.team === 'home';
  const teamColor = isHome ? 'text-blue-400' : 'text-red-400';
  const teamBg    = isHome ? 'bg-blue-500/10 border-blue-500/30' : 'bg-red-500/10 border-red-500/30';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-full max-w-sm rounded-2xl border ${teamBg} p-5 shadow-2xl`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-base font-bold ${teamColor}`}>
                Jugador #{selectedPlayer.playerId}
              </h2>
              <p className="text-[10px] text-white/50 uppercase">
                {isHome ? 'Local' : 'Visitante'} · Q{matchState.currentQuarter}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="text-white/50 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action buttons */}
          <ActionGrid team={selectedPlayer.team} onAction={handleAction} />

          {/* Cancel */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="mt-3 w-full py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-xs font-bold uppercase transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};

export default ActionModal;

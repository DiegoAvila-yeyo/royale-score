'use client';

import React from 'react';
import { useGameContext, useUIState } from '@/context/GameContext';
import { ActionType } from '@/types/gameEngine';
import { X } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional callback fired after an action is recorded (for Toast notifications) */
  onActionRecorded?: (actionLabel: string, playerNum: number, team: 'home' | 'away') => void;
}

const QUICK_ACTIONS: { label: string; value: ActionType; icon: string }[] = [
  { label: 'Falta', value: 'Falta', icon: '🚫' },
  { label: 'Robo', value: 'Robo', icon: '🎯' },
  { label: 'Asist', value: 'Asist', icon: '🤝' },
  { label: 'Tapón', value: 'Tapón', icon: '🛡️' },
  { label: 'Rebound', value: 'Rebound', icon: '📦' },
  { label: 'Turnover', value: 'Turnover', icon: '💥' },
  { label: 'Timeout', value: 'Timeout', icon: '⏸️' },
  { label: 'Puntos', value: 'Puntos', icon: '🏀' },
];

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, onActionRecorded }) => {
  const { selectedPlayer } = useUIState();
  const { matchState, actions } = useGameContext();

  if (!isOpen || !selectedPlayer) return null;

  const handleAction = (actionType: ActionType, actionLabel: string) => {
    if (selectedPlayer) {
      actions.recordAction(
        selectedPlayer.playerId,
        selectedPlayer.team,
        actionType,
        matchState.currentQuarter,
        matchState.timeLeftMs,
        0
      );
      onActionRecorded?.(actionLabel, selectedPlayer.playerId, selectedPlayer.team);
      onClose();
    }
  };

  const getPlayerTeamColor = () => {
    return selectedPlayer.team === 'home' ? 'text-blue-400' : 'text-red-400';
  };

  const getPlayerTeamBg = () => {
    return selectedPlayer.team === 'home'
      ? 'bg-blue-500/10 border-blue-500/30'
      : 'bg-red-500/10 border-red-500/30';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className={`w-full max-w-md rounded-2xl border ${getPlayerTeamBg()} p-6 shadow-2xl`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-lg font-bold ${getPlayerTeamColor()}`}>
                Player #{selectedPlayer.playerId}
              </h2>
              <p className="text-xs text-white/50 uppercase">
                {selectedPlayer.team === 'home' ? 'Local' : 'Visitante'} | Q{matchState.currentQuarter}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(action.value, action.label);
                }}
                className={`py-3 px-2 rounded-lg font-bold text-xs uppercase transition-all border ${
                  selectedPlayer.team === 'home'
                    ? 'border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50'
                    : 'border-red-500/30 hover:bg-red-500/20 hover:border-red-400/50'
                } text-white/80 hover:text-white active:scale-95`}
              >
                <div className="text-lg mb-1">{action.icon}</div>
                <div>{action.label}</div>
              </button>
            ))}
          </div>

          {/* Cancel Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold uppercase transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default ActionModal;

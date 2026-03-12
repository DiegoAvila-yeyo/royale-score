'use client';
import React from 'react';
import { ActionType } from '@/types/gameEngine';

export const QUICK_ACTIONS: { label: string; value: ActionType; icon: string }[] = [
  { label: 'Falta',    value: 'Falta',    icon: '🚫' },
  { label: 'Robo',     value: 'Robo',     icon: '🎯' },
  { label: 'Asist',    value: 'Asist',    icon: '🤝' },
  { label: 'Tapón',    value: 'Tapón',    icon: '🛡️' },
  { label: 'Rebound',  value: 'Rebound',  icon: '📦' },
  { label: 'Turnover', value: 'Turnover', icon: '💥' },
  { label: 'Timeout',  value: 'Timeout',  icon: '⏸️' },
  { label: 'Puntos',   value: 'Puntos',   icon: '🏀' },
];

export interface ActionGridProps {
  team: 'home' | 'away';
  onAction: (type: ActionType, label: string) => void;
}

export const ActionGrid: React.FC<ActionGridProps> = ({ team, onAction }) => {
  const borderClass =
    team === 'home'
      ? 'border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50'
      : 'border-red-500/30 hover:bg-red-500/20 hover:border-red-400/50';

  return (
    <div className="grid grid-cols-2 gap-2">
      {QUICK_ACTIONS.map((a) => (
        <button
          key={a.value}
          onClick={(e) => { e.stopPropagation(); onAction(a.value, a.label); }}
          className={`py-3 px-2 rounded-lg font-bold text-xs uppercase transition-all border
            ${borderClass} text-white/80 hover:text-white active:scale-95`}
        >
          <div className="text-lg mb-1">{a.icon}</div>
          <div>{a.label}</div>
        </button>
      ))}
    </div>
  );
};

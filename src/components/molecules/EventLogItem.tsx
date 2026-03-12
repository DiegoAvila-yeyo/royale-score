'use client';
import React from 'react';
import { Trash2 } from 'lucide-react';
import { MatchEvent } from '@/types/gameEngine';

const ACTION_ICONS: Record<string, string> = {
  Falta: '🚫', Robo: '🎯', Asist: '🤝', Tapón: '🛡️',
  Rebound: '📦', Turnover: '💥', Timeout: '⏸️', Puntos: '🏀',
};

const fmtClock = (ms: number) => {
  const s = Math.floor((ms / 1000) % 60);
  const m = Math.floor(ms / 60000);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export interface EventLogItemProps {
  event: MatchEvent;
  onUndo: () => void;
  canUndo: boolean;
}

export const EventLogItem: React.FC<EventLogItemProps> = ({ event, onUndo, canUndo }) => {
  const isHome = event.team === 'home';
  const bg = isHome ? 'bg-blue-500/10' : 'bg-red-500/10';
  const textColor = isHome ? 'text-blue-300' : 'text-red-300';

  return (
    <div className={`flex items-center justify-between ${bg} p-2 rounded border border-white/10`}>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-sm">{ACTION_ICONS[event.actionType] ?? '📝'}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-xs ${textColor}`}>#{event.playerId}</div>
          <div className="text-[8px] text-white/50 truncate">
            {event.actionType} · Q{event.quarter} {fmtClock(event.gameClockMs)}
          </div>
        </div>
      </div>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`ml-1 p-1 rounded transition-all flex-shrink-0 ${
          canUndo
            ? 'text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-500/10'
            : 'text-white/20 cursor-not-allowed'
        }`}
        title="Deshacer última acción"
        aria-label="Deshacer"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};

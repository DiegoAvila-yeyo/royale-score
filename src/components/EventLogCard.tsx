'use client';

import React from 'react';
import { MatchEvent } from '@/types/gameEngine';
import { Trash2 } from 'lucide-react';

interface EventLogCardProps {
  event: MatchEvent;
  onUndo: (event: MatchEvent) => void;
  canUndo: boolean;
}

const ActionEmoji: Record<string, string> = {
  Falta: '🚫',
  Robo: '🎯',
  Asist: '🤝',
  Tapón: '🛡️',
  Rebound: '📦',
  Turnover: '💥',
  Timeout: '⏸️',
  Puntos: '🏀',
  Colada: '✨',
  'Tiro Libre': '🎯',
};

const getTeamColor = (team: string) => {
  return team === 'home' ? 'text-blue-300' : 'text-red-300';
};

const getTeamBg = (team: string) => {
  return team === 'home' ? 'bg-blue-500/10' : 'bg-red-500/10';
};

const formatGameClock = (timeLeftMs: number) => {
  const seconds = Math.floor((timeLeftMs / 1000) % 60);
  const minutes = Math.floor((timeLeftMs / (1000 * 60)) % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const EventLogCard: React.FC<EventLogCardProps> = ({ event, onUndo, canUndo }) => {
  const emoji = ActionEmoji[event.actionType] || '📝';

  return (
    <div className={`flex items-center justify-between text-[8px] ${getTeamBg(event.team)} p-2 rounded border border-white/10 mb-1`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-lg">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-xs ${getTeamColor(event.team)}`}>
            Player #{event.playerId}
          </div>
          <div className="text-white/50 truncate">
            {event.actionType} • Q{event.quarter} {formatGameClock(event.gameClockMs)}
          </div>
        </div>
      </div>
      <button
        onClick={() => onUndo(event)}
        disabled={!canUndo}
        className={`ml-1 p-1 rounded transition-all flex-shrink-0 ${
          canUndo
            ? 'text-yellow-500/70 hover:text-yellow-400 hover:bg-yellow-500/10'
            : 'text-white/20 cursor-not-allowed'
        }`}
        title={canUndo ? 'Undo this action' : 'Cannot undo'}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};

export default EventLogCard;

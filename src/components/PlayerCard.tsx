/**
 * PlayerCard.tsx - Jersey-style player visualization
 * Shows player number, position, and live stats
 */

"use client";

import React from 'react';
import { PlayerId } from '@/types/gameEngine';

interface PlayerCardProps {
  player: {
    id: PlayerId;
    jerseyNumber: number;
    position: string;
    stats: {
      pointsScored: number;
      fouls: number;
    };
  };
  position: { x: number; y: number };
  isSelected: boolean;
  onSelect: () => void;
  teamColor: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  position,
  isSelected,
  onSelect,
  teamColor,
}) => {
  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer group"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* Jersey visualization */}
      <button
        onClick={onSelect}
        className={`
          relative w-12 h-12 md:w-14 md:h-14 rounded-2xl font-bold text-white transition-all duration-300
          flex items-center justify-center text-lg md:text-xl font-black
          border-2 backdrop-blur-sm
          ${isSelected
            ? `border-white drop-shadow-lg`
            : `border-opacity-40 hover:border-opacity-80 hover:scale-110 hover:drop-shadow-md`
          }
        `}
        style={{
          backgroundColor: isSelected ? teamColor : `${teamColor}70`,
          borderColor: teamColor,
          boxShadow: isSelected ? `0 0 25px ${teamColor}80` : 'none',
          transform: isSelected ? 'translate(-50%, -50%) scale(1.25)' : 'translate(-50%, -50%)',
        }}
        title={`${player.position} (#${player.jerseyNumber})`}
      >
        {player.jerseyNumber}
      </button>

      {/* Position label */}
      <span
        className={`
          text-[10px] font-bold mt-1 transition-all duration-200 whitespace-nowrap
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
        style={{ color: teamColor }}
      >
        {player.position}
      </span>

      {/* Stats display (compact) */}
      {isSelected && (
        <div className="mt-2 text-center text-[9px] font-semibold">
          <div style={{ color: teamColor }}>Pts: {player.stats.pointsScored}</div>
          <div style={{ color: 'rgba(248, 113, 113, 0.8)' }}>F: {player.stats.fouls}</div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;

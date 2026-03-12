/**
 * Court.tsx - Single court visualization (reusable for home and away teams)
 * Displays 5 players per team in tactical positions
 */

"use client";

import React from 'react';
import { PlayerId, Position } from '@/types/gameEngine';
import { UI_TOKENS } from '@/styles/tokens';
import PlayerCard from '@/components/PlayerCard';

const PLAYER_POSITIONS: Record<Position, { x: number; y: number }> = {
  PG: { x: 50, y: 20 },   // Point Guard - top of key
  SG: { x: 25, y: 35 },   // Shooting Guard - left wing
  SF: { x: 75, y: 35 },   // Small Forward - right wing
  PF: { x: 30, y: 65 },   // Power Forward - low left
  C: { x: 70, y: 70 },    // Center - low right
};

interface CourtProps {
  team: 'home' | 'away';
  players: Array<{
    id: PlayerId;
    jerseyNumber: number;
    position: Position;
    stats: {
      pointsScored: number;
      fouls: number;
    };
  }>;
  selectedPlayerId: PlayerId | null;
  onPlayerSelect: (playerId: PlayerId) => void;
  teamColor: string;
}

const Court: React.FC<CourtProps> = ({
  team,
  players,
  selectedPlayerId,
  onPlayerSelect,
  teamColor,
}) => {
  return (
    <div
      className={`relative w-full aspect-[4/5] ${UI_TOKENS.glass} rounded-3xl overflow-hidden border border-white/10`}
      style={{ backgroundColor: team === 'home' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(248, 113, 113, 0.05)' }}
    >
      {/* Court Markings SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Court border */}
        <rect x="5" y="5" width="90" height="90" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-white/30" />

        {/* Baseline */}
        <line x1="5" y1="5" x2="95" y2="5" stroke="currentColor" strokeWidth="0.2" className="text-white/40" />

        {/* Free throw lane  */}
        <g stroke="currentColor" strokeWidth="0.2" fill="none" className="text-white/40">
          <rect x="15" y="5" width="20" height="35" />
          <rect x="65" y="5" width="20" height="35" />
        </g>

        {/* Three-point line */}
        <g stroke="currentColor" strokeWidth="0.15" fill="none" className="text-white/25">
          <path d="M 5 15 L 20 15 Q 20 5 30 5" />
          <path d="M 95 15 L 80 15 Q 80 5 70 5" />
        </g>

        {/* Free throw circles */}
        <circle cx="35" cy="40" r="6" stroke="currentColor" strokeWidth="0.15" fill="none" className="text-white/30" />
        <circle cx="65" cy="40" r="6" stroke="currentColor" strokeWidth="0.15" fill="none" className="text-white/30" />

        {/* Center court circle */}
        <circle cx="50" cy="95" r="5" stroke="currentColor" strokeWidth="0.15" fill="none" className="text-white/25" />

        {/* Center line */}
        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.15" className="text-white/20" />
      </svg>

      {/* Court floor gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-orange-900/5 to-amber-900/10 pointer-events-none" />

      {/* Hoop indicator */}
      <div className="absolute top-[8%] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500/60 rounded-full border border-red-400/40 shadow-lg" />
      <div className="absolute top-[8%] left-1/2 transform -translate-x-1/2 w-4 h-4 border border-red-400/30 rounded-full" />

      {/* Player Cards */}
      {players.map((player) => {
        const position = player.position;
        const pos = PLAYER_POSITIONS[position];

        return (
          <PlayerCard
            key={player.id}
            player={player}
            position={pos}
            isSelected={selectedPlayerId === player.id}
            onSelect={() => onPlayerSelect(player.id)}
            teamColor={teamColor}
          />
        );
      })}
    </div>
  );
};

export default Court;

import React from 'react';
import { PlayerId } from '@/types/game';
import { UI_TOKENS } from '@/styles/tokens';

interface BasketballCourtProps {
  selectedPlayer: PlayerId | null;
  onSelectPlayer: (id: PlayerId) => void;
}

// Tactical positions for basketball players
const PLAYER_POSITIONS: Record<PlayerId, { x: number; y: number; label: string }> = {
  1: { x: 50, y: 25, label: 'Base' },        // Point Guard - Top of key
  2: { x: 25, y: 40, label: 'Escolta' },     // Shooting Guard - Left wing
  3: { x: 75, y: 40, label: 'Alero' },       // Small Forward - Right wing
  4: { x: 30, y: 65, label: 'Ala-Pívot' },   // Power Forward - Low left
  5: { x: 70, y: 70, label: 'Pívot' },       // Center - Low right
};

// Court markings component
const CourtMarkings = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
    {/* Court border */}
    <rect x="5" y="5" width="90" height="90" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-white/30" />

    {/* Baseline */}
    <line x1="5" y1="5" x2="95" y2="5" stroke="currentColor" strokeWidth="0.2" className="text-white/40" />

    {/* Sidelines are the borders */}

    {/* Free throw lane (painted area) */}
    <g stroke="currentColor" strokeWidth="0.2" fill="none" className="text-white/40">
      {/* Left lane */}
      <rect x="15" y="5" width="20" height="35" />
      {/* Right lane */}
      <rect x="65" y="5" width="20" height="35" />
    </g>

    {/* Three-point line */}
    <g stroke="currentColor" strokeWidth="0.15" fill="none" className="text-white/25">
      {/* Left three-point */}
      <path d="M 5 15 L 20 15 Q 20 5 30 5" />
      {/* Right three-point */}
      <path d="M 95 15 L 80 15 Q 80 5 70 5" />
    </g>

    {/* Free throw circle (top) */}
    <circle cx="35" cy="40" r="6" stroke="currentColor" strokeWidth="0.15" fill="none" className="text-white/30" />
    <circle cx="65" cy="40" r="6" stroke="currentColor" strokeWidth="0.15" fill="none" className="text-white/30" />

    {/* Center court circle */}
    <circle cx="50" cy="95" r="5" stroke="currentColor" strokeWidth="0.15" fill="none" className="text-white/25" />

    {/* Center line (half court) */}
    <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.15" className="text-white/20" />
  </svg>
);

// Player node component with jersey visualization
interface PlayerNodeProps {
  id: PlayerId;
  isSelected: boolean;
  onSelect: () => void;
  x: number;
  y: number;
  label: string;
}

const PlayerNode: React.FC<PlayerNodeProps> = ({ id, isSelected, onSelect, x, y, label }) => (
  <div
    className="absolute flex flex-col items-center cursor-pointer group"
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
  >
    {/* Jersey visualization */}
    <button
      onClick={onSelect}
      className={`
        relative w-12 h-12 md:w-14 md:h-14 rounded-2xl font-bold text-white transition-all duration-300
        flex items-center justify-center text-lg md:text-xl font-black
        border-2 backdrop-blur-sm
        ${isSelected
          ? 'bg-blue-500/90 border-white shadow-[0_0_30px_rgba(59,130,246,0.8)] scale-125'
          : 'bg-gradient-to-br from-blue-600/70 to-blue-800/50 border-blue-400/40 hover:border-blue-400/80 hover:scale-110 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]'
        }
      `}
      title={`${label} (#${id})`}
    >
      {id}
    </button>

    {/* Player label */}
    <span className={`
      text-[10px] font-bold mt-1 transition-all duration-200
      ${isSelected ? 'text-blue-400 opacity-100' : 'text-white/50 opacity-0 group-hover:opacity-100'}
    `}>
      {label}
    </span>
  </div>
);

export const BasketballCourt = ({ selectedPlayer, onSelectPlayer }: BasketballCourtProps) => {
  const players: PlayerId[] = [1, 2, 3, 4, 5];

  return (
    <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0">
      {/* Court Container - Responsive */}
      <div className={`relative w-full flex-1 min-h-0 ${UI_TOKENS.glass} rounded-3xl overflow-hidden border border-white/10`}>

        {/* Court Markings Background */}
        <div className="absolute inset-0 text-white/20">
          <CourtMarkings />
        </div>

        {/* Court Floor Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-orange-900/5 to-amber-900/10 pointer-events-none" />

        {/* Hoop and Basket indicators */}
        <div className="absolute top-[8%] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500/60 rounded-full border border-red-400/40 shadow-lg" />
        <div className="absolute top-[8%] left-1/2 transform -translate-x-1/2 w-4 h-4 border border-red-400/30 rounded-full" />

        {/* Player Nodes */}
        {players.map((id) => {
          const pos = PLAYER_POSITIONS[id];
          return (
            <PlayerNode
              key={id}
              id={id}
              isSelected={selectedPlayer === id}
              onSelect={() => onSelectPlayer(id)}
              x={pos.x}
              y={pos.y}
              label={pos.label}
            />
          );
        })}
      </div>

      {/* Legend - Responsive */}
      <div className="hidden md:grid grid-cols-5 gap-2 text-center text-[10px]">
        {players.map((id) => {
          const pos = PLAYER_POSITIONS[id];
          return (
            <div key={id} className={`py-2 px-1 rounded-lg transition-all ${selectedPlayer === id ? 'bg-blue-500/20 border border-blue-400/50' : 'bg-white/5 border border-white/10'}`}>
              <div className="font-bold text-xs">{pos.label}</div>
              <div className="text-[9px] text-white/60">#{id}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
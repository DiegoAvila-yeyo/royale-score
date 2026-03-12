'use client';

import React from 'react';
import { useUIState } from '@/context/GameContext';
import { PlayerId } from '@/types/gameEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

interface CourtPlayer {
  id: PlayerId;
  jerseyNumber: number;
  position: Position;
  team: 'home' | 'away';
}

interface UnifiedCourtProps {
  homeTeam?: string;
  awayTeam?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// NBA Full Court: 94 ft × 50 ft → SVG viewBox 940 × 500  (1 unit = 1 ft × 10)
const COURT_W = 940;
const COURT_H = 500;

// Basket positions (5.25 ft from baseline, centered)
const LEFT_BASKET = { x: 52, y: 250 };
const RIGHT_BASKET = { x: 888, y: 250 };

// Team colors
const HOME_COLOR = '#3B82F6'; // blue-500
const AWAY_COLOR = '#EF4444'; // red-500

// Tactical positions for home (attacks RIGHT basket) and away (attacks LEFT basket)
const HOME_POS: Record<Position, { x: number; y: number }> = {
  PG: { x: 330, y: 250 },  // Ball handler near half court
  SG: { x: 215, y: 145 },  // Wing – top left
  SF: { x: 215, y: 355 },  // Corner – bottom left
  PF: { x: 138, y: 192 },  // Elbow / high post left
  C:  { x: 112, y: 250 },  // Low post left
};

const AWAY_POS: Record<Position, { x: number; y: number }> = {
  PG: { x: 610, y: 250 },
  SG: { x: 725, y: 145 },
  SF: { x: 725, y: 355 },
  PF: { x: 802, y: 192 },
  C:  { x: 828, y: 250 },
};

const POSITION_LABEL: Record<Position, string> = {
  PG: 'Base',
  SG: 'Escolta',
  SF: 'Alero',
  PF: 'Ala-Pívot',
  C:  'Pívot',
};

const PLAYERS: CourtPlayer[] = [
  { id: 1  as PlayerId, jerseyNumber: 1,  position: 'PG', team: 'home' },
  { id: 2  as PlayerId, jerseyNumber: 2,  position: 'SG', team: 'home' },
  { id: 3  as PlayerId, jerseyNumber: 3,  position: 'SF', team: 'home' },
  { id: 4  as PlayerId, jerseyNumber: 4,  position: 'PF', team: 'home' },
  { id: 5  as PlayerId, jerseyNumber: 5,  position: 'C',  team: 'home' },
  { id: 6  as PlayerId, jerseyNumber: 6,  position: 'PG', team: 'away' },
  { id: 7  as PlayerId, jerseyNumber: 7,  position: 'SG', team: 'away' },
  { id: 8  as PlayerId, jerseyNumber: 8,  position: 'SF', team: 'away' },
  { id: 9  as PlayerId, jerseyNumber: 9,  position: 'PF', team: 'away' },
  { id: 10 as PlayerId, jerseyNumber: 10, position: 'C',  team: 'away' },
];

// ─── Court SVG Markings ───────────────────────────────────────────────────────

const CourtMarkings: React.FC = () => {
  const LINE = { stroke: 'white', strokeWidth: 2, fill: 'none' };
  const LINE_THIN = { stroke: 'white', strokeWidth: 1.5, fill: 'none' };

  return (
    <>
      {/* ── Parquet wood floor ── */}
      <defs>
        <linearGradient id="courtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#b86e1e" />
          <stop offset="40%"  stopColor="#d4892a" />
          <stop offset="60%"  stopColor="#d4892a" />
          <stop offset="100%" stopColor="#b86e1e" />
        </linearGradient>
        {/* Horizontal wood planks */}
        <pattern id="planks" x="0" y="0" width={COURT_W} height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="10" x2={COURT_W} y2="10" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" />
          <line x1="0" y1="20" x2={COURT_W} y2="20" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" />
          {/* Vertical plank joints, offset per row */}
          {[80,200,340,470,610,750,880].map((x, i) => (
            <line key={i} x1={x} y1="0" x2={x} y2="10" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
          ))}
          {[140,270,400,530,660,810].map((x, i) => (
            <line key={i} x1={x} y1="10" x2={x} y2="20" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
          ))}
        </pattern>
        {/* Glow filter for selected player */}
        <filter id="playerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Floor base */}
      <rect width={COURT_W} height={COURT_H} fill="url(#courtGrad)" />
      <rect width={COURT_W} height={COURT_H} fill="url(#planks)" />

      {/* Court border */}
      <rect x="0" y="0" width={COURT_W} height={COURT_H} {...LINE} strokeWidth={3} />

      {/* Half-court line */}
      <line x1="470" y1="0" x2="470" y2={COURT_H} {...LINE} />

      {/* Center circle + dot */}
      <circle cx="470" cy="250" r="60" {...LINE} />
      <circle cx="470" cy="250" r="3" fill="white" />

      {/* ──────────── LEFT SIDE ──────────── */}
      {/* Paint / key (19 ft deep, 16 ft wide: 190 × 160 px) */}
      <rect x="0" y="170" width="190" height="160"
        fill="rgba(59,130,246,0.13)" stroke="white" strokeWidth="2" />

      {/* Free throw circle – solid half (toward basket) */}
      <path d="M 190 190 A 60 60 0 0 0 190 310" {...LINE} />
      {/* Free throw circle – dashed half (toward half court) */}
      <path d="M 190 190 A 60 60 0 0 1 190 310" {...LINE_THIN} strokeDasharray="6 5" />

      {/* 3-point line – corners */}
      <line x1="0" y1="30"  x2="142" y2="30"  {...LINE} />
      <line x1="0" y1="470" x2="142" y2="470" {...LINE} />
      {/* 3-point arc (r=23.75 ft = 237.5 px from basket) */}
      <path d="M 142 30 A 237.5 237.5 0 0 1 142 470" {...LINE} />

      {/* Restricted area arc (r=4 ft = 40 px) */}
      <path d="M 52 210 A 40 40 0 0 1 52 290" {...LINE_THIN} />

      {/* Backboard */}
      <line x1="43" y1="225" x2="43" y2="275" stroke="white" strokeWidth="3" />
      {/* Hoop */}
      <circle cx={LEFT_BASKET.x} cy={LEFT_BASKET.y} r="9"
        fill="none" stroke="rgba(255,100,50,0.9)" strokeWidth="2.5" />

      {/* Lane hash marks – left paint top */}
      {[115, 155].map((x, i) => (
        <line key={i} x1={x} y1="157" x2={x} y2="170" stroke="white" strokeWidth="1.5" />
      ))}
      {/* Lane hash marks – left paint bottom */}
      {[115, 155].map((x, i) => (
        <line key={i} x1={x} y1="330" x2={x} y2="343" stroke="white" strokeWidth="1.5" />
      ))}

      {/* ──────────── RIGHT SIDE ──────────── */}
      {/* Paint / key */}
      <rect x="750" y="170" width="190" height="160"
        fill="rgba(239,68,68,0.13)" stroke="white" strokeWidth="2" />

      {/* Free throw circle – solid half (toward basket) */}
      <path d="M 750 190 A 60 60 0 0 1 750 310" {...LINE} />
      {/* Free throw circle – dashed half */}
      <path d="M 750 190 A 60 60 0 0 0 750 310" {...LINE_THIN} strokeDasharray="6 5" />

      {/* 3-point line – corners */}
      <line x1="940" y1="30"  x2="798" y2="30"  {...LINE} />
      <line x1="940" y1="470" x2="798" y2="470" {...LINE} />
      {/* 3-point arc */}
      <path d="M 798 30 A 237.5 237.5 0 0 0 798 470" {...LINE} />

      {/* Restricted area arc */}
      <path d="M 888 210 A 40 40 0 0 0 888 290" {...LINE_THIN} />

      {/* Backboard */}
      <line x1="897" y1="225" x2="897" y2="275" stroke="white" strokeWidth="3" />
      {/* Hoop */}
      <circle cx={RIGHT_BASKET.x} cy={RIGHT_BASKET.y} r="9"
        fill="none" stroke="rgba(255,100,50,0.9)" strokeWidth="2.5" />

      {/* Lane hash marks – right paint top */}
      {[785, 825].map((x, i) => (
        <line key={i} x1={x} y1="157" x2={x} y2="170" stroke="white" strokeWidth="1.5" />
      ))}
      {/* Lane hash marks – right paint bottom */}
      {[785, 825].map((x, i) => (
        <line key={i} x1={x} y1="330" x2={x} y2="343" stroke="white" strokeWidth="1.5" />
      ))}
    </>
  );
};

// ─── Player Node (SVG) ────────────────────────────────────────────────────────

interface PlayerNodeProps {
  player: CourtPlayer;
  pos: { x: number; y: number };
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

const PlayerNode: React.FC<PlayerNodeProps> = ({ player, pos, isSelected, onSelect }) => {
  const color = player.team === 'home' ? HOME_COLOR : AWAY_COLOR;
  const { x, y } = pos;

  return (
    <g
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={`Jugador ${player.jerseyNumber} – ${POSITION_LABEL[player.position]}`}
    >
      {/* Large invisible hit area for easy mobile tapping */}
      <circle cx={x} cy={y} r={34} fill="transparent" />

      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={x} cy={y} r={26}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          opacity="0.9"
          filter="url(#playerGlow)"
        />
      )}

      {/* Outer pulse ring when selected */}
      {isSelected && (
        <circle cx={x} cy={y} r={30} fill="none" stroke={color} strokeWidth="1" opacity="0.45" />
      )}

      {/* Player circle */}
      <circle
        cx={x} cy={y} r={20}
        fill={isSelected ? color : `${color}cc`}
        stroke="white"
        strokeWidth={isSelected ? 2.5 : 1.5}
        filter={isSelected ? 'url(#playerGlow)' : undefined}
      />

      {/* Jersey number */}
      <text
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={player.jerseyNumber >= 10 ? '11' : '13'}
        fontWeight="900"
        fill="white"
        fontFamily="system-ui, Arial, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {player.jerseyNumber}
      </text>

      {/* Position label – always visible, small */}
      <text
        x={x} y={y + 28}
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="bold"
        fill={isSelected ? color : 'rgba(255,255,255,0.7)'}
        fontFamily="system-ui, Arial, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {player.position}
      </text>
    </g>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UnifiedCourt: React.FC<UnifiedCourtProps> = ({
  homeTeam = 'LOCAL',
  awayTeam = 'VISITANTE',
}) => {
  const { selectedPlayer, setSelectedPlayer, setActiveTeamFocus } = useUIState();

  const handlePlayerSelect = (player: CourtPlayer, e: React.MouseEvent) => {
    // stopPropagation prevents triggering parent navigation/menu listeners (mobile bug fix)
    e.stopPropagation();
    setSelectedPlayer(player.id, player.team);
  };

  // Mobile team focus toggle – uses setActiveTeamFocus (NOT setSelectedPlayer)
  // to avoid auto-opening the action modal on team switch
  const handleTeamFocus = (team: 'home' | 'away', e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTeamFocus(team);
  };

  const activeSide = selectedPlayer?.team ?? null;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* ── Team Header Labels (desktop) ── */}
      <div className="hidden md:flex items-center justify-between px-1">
        <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">
          ● {homeTeam}
        </span>
        <span className="text-[10px] text-white/30 font-mono">FULL COURT · NBA RULES</span>
        <span className="text-xs font-bold text-red-400 tracking-widest uppercase">
          {awayTeam} ●
        </span>
      </div>

      {/* ── Mobile team focus toggle ── */}
      <div className="flex md:hidden gap-2 bg-white/5 border border-white/10 rounded-lg p-1 z-10">
        <button
          onClick={(e) => handleTeamFocus('home', e)}
          className={`flex-1 py-2 px-3 rounded font-bold text-xs transition-all ${
            activeSide === 'home' || activeSide === null
              ? 'bg-blue-500/80 text-white'
              : 'bg-transparent text-blue-400/70'
          }`}
        >
          🔵 {homeTeam}
        </button>
        <button
          onClick={(e) => handleTeamFocus('away', e)}
          className={`flex-1 py-2 px-3 rounded font-bold text-xs transition-all ${
            activeSide === 'away'
              ? 'bg-red-500/80 text-white'
              : 'bg-transparent text-red-400/70'
          }`}
        >
          🔴 {awayTeam}
        </button>
      </div>

      {/* ── Court Container – horizontally scrollable on mobile ── */}
      <div
        className="w-full overflow-x-auto rounded-2xl border-2 border-white/10 shadow-2xl"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <svg
          viewBox={`0 0 ${COURT_W} ${COURT_H}`}
          xmlns="http://www.w3.org/2000/svg"
          className="block"
          style={{ minWidth: '580px', width: '100%' }}
          preserveAspectRatio="xMidYMid meet"
          aria-label="Cancha de baloncesto completa"
        >
          {/* Court lines + parquet */}
          <CourtMarkings />

          {/* Team label on court */}
          <text x="235" y="25" textAnchor="middle" fontSize="11" fontWeight="bold"
            fill="rgba(147,197,253,0.8)" fontFamily="system-ui, sans-serif">
            {homeTeam}
          </text>
          <text x="705" y="25" textAnchor="middle" fontSize="11" fontWeight="bold"
            fill="rgba(252,165,165,0.8)" fontFamily="system-ui, sans-serif">
            {awayTeam}
          </text>

          {/* Player nodes */}
          {PLAYERS.map((player) => {
            const pos = player.team === 'home'
              ? HOME_POS[player.position]
              : AWAY_POS[player.position];
            const isSelected =
              selectedPlayer?.playerId === player.id &&
              selectedPlayer?.team === player.team;
            return (
              <PlayerNode
                key={`${player.team}-${player.id}`}
                player={player}
                pos={pos}
                isSelected={isSelected}
                onSelect={(e) => handlePlayerSelect(player, e)}
              />
            );
          })}
        </svg>
      </div>

      {/* ── Position legend (desktop only) ── */}
      <div className="hidden md:grid grid-cols-10 gap-1 text-center text-[9px] mt-1">
        {PLAYERS.map((p) => (
          <div
            key={`legend-${p.team}-${p.id}`}
            className={`py-1 rounded transition-all ${
              selectedPlayer?.playerId === p.id && selectedPlayer?.team === p.team
                ? p.team === 'home'
                  ? 'bg-blue-500/25 border border-blue-400/50'
                  : 'bg-red-500/25 border border-red-400/50'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div
              className="font-bold text-[10px]"
              style={{ color: p.team === 'home' ? HOME_COLOR : AWAY_COLOR }}
            >
              {p.position}
            </div>
            <div className="text-white/50">#{p.jerseyNumber}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnifiedCourt;

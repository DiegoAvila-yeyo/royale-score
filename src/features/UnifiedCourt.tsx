'use client';
/**
 * UnifiedCourt — Full NBA court with 10 players.
 * Adapts between landscape (desktop) and portrait (mobile) orientations.
 * Portrait mode: court rotated 90° via SVG matrix transform so home team
 * appears at the bottom (ergonomic for one-handed scoring).
 */
import React, { memo } from 'react';
import { useUIState } from '@/context/GameContext';
import { PlayerId } from '@/types/gameEngine';
import { PlayerNode } from '@/components/atoms/PlayerNode';
import { useCourtLayout, CourtOrientation } from '@/hooks/useCourtLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
interface CourtPlayer { id: PlayerId; jerseyNumber: number; position: Position; team: 'home' | 'away' }

// ─── Constants ────────────────────────────────────────────────────────────────

const COURT_W = 940;
const COURT_H = 500;

/** Landscape tactical positions (x,y in 940×500 space) */
const HOME_POS: Record<Position, { x: number; y: number }> = {
  PG: { x: 330, y: 250 },
  SG: { x: 215, y: 145 },
  SF: { x: 215, y: 355 },
  PF: { x: 138, y: 192 },
  C:  { x: 112, y: 250 },
};
const AWAY_POS: Record<Position, { x: number; y: number }> = {
  PG: { x: 610, y: 250 },
  SG: { x: 725, y: 145 },
  SF: { x: 725, y: 355 },
  PF: { x: 802, y: 192 },
  C:  { x: 828, y: 250 },
};

/**
 * Portrait transform: rotate landscape 90° CCW.
 * Maps (x_l, y_l) → (x_p, y_p) where:
 *   x_p = y_l          (0-500 → 0-500)
 *   y_p = 940 - x_l    (0-940 → 940-0)
 * SVG matrix: matrix(0, -1, 1, 0, 0, 940)
 */
const toPortrait = (x: number, y: number) => ({ x: y, y: COURT_W - x });

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

// ─── Court Markings SVG Fragment ─────────────────────────────────────────────

const L = { stroke: 'white', strokeWidth: 2, fill: 'none' } as const;
const LT = { stroke: 'white', strokeWidth: 1.5, fill: 'none' } as const;

const CourtMarkings: React.FC<{ orientation: CourtOrientation }> = ({ orientation }) => {
  const groupTransform = orientation === 'portrait'
    ? `matrix(0, -1, 1, 0, 0, ${COURT_W})`
    : undefined;

  return (
    <>
      <defs>
        <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#b86e1e" />
          <stop offset="40%"  stopColor="#d4892a" />
          <stop offset="60%"  stopColor="#d4892a" />
          <stop offset="100%" stopColor="#b86e1e" />
        </linearGradient>
        <pattern id="planks" x="0" y="0" width={COURT_W} height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="10" x2={COURT_W} y2="10" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" />
          <line x1="0" y1="20" x2={COURT_W} y2="20" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" />
          {[80,200,340,470,610,750,880].map((x, i) =>
            <line key={`pa${i}`} x1={x} y1="0" x2={x} y2="10" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />)}
          {[140,270,400,530,660,810].map((x, i) =>
            <line key={`pb${i}`} x1={x} y1="10" x2={x} y2="20" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />)}
        </pattern>
        <filter id="playerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* The entire court is drawn in landscape coords, then transformed for portrait */}
      <g transform={groupTransform}>
        <rect width={COURT_W} height={COURT_H} fill="url(#cGrad)" />
        <rect width={COURT_W} height={COURT_H} fill="url(#planks)" />
        <rect x="0" y="0" width={COURT_W} height={COURT_H} {...L} strokeWidth={3} />

        {/* Half-court */}
        <line x1="470" y1="0" x2="470" y2={COURT_H} {...L} />
        <circle cx="470" cy="250" r="60" {...L} />
        <circle cx="470" cy="250" r="3" fill="white" />

        {/* ── LEFT (HOME) ── */}
        <rect x="0" y="170" width="190" height="160" fill="rgba(59,130,246,0.13)" stroke="white" strokeWidth="2" />
        <path d="M 190 190 A 60 60 0 0 0 190 310" {...L} />
        <path d="M 190 190 A 60 60 0 0 1 190 310" {...LT} strokeDasharray="6 5" />
        <line x1="0" y1="30" x2="142" y2="30" {...L} />
        <line x1="0" y1="470" x2="142" y2="470" {...L} />
        <path d="M 142 30 A 237.5 237.5 0 0 1 142 470" {...L} />
        <path d="M 52 210 A 40 40 0 0 1 52 290" {...LT} />
        <line x1="43" y1="225" x2="43" y2="275" stroke="white" strokeWidth="3" />
        <circle cx="52" cy="250" r="9" fill="none" stroke="rgba(255,100,50,0.9)" strokeWidth="2.5" />
        {[115,155].map((x,i) => <line key={`lt${i}`} x1={x} y1="157" x2={x} y2="170" stroke="white" strokeWidth="1.5" />)}
        {[115,155].map((x,i) => <line key={`lb${i}`} x1={x} y1="330" x2={x} y2="343" stroke="white" strokeWidth="1.5" />)}

        {/* ── RIGHT (AWAY) ── */}
        <rect x="750" y="170" width="190" height="160" fill="rgba(239,68,68,0.13)" stroke="white" strokeWidth="2" />
        <path d="M 750 190 A 60 60 0 0 1 750 310" {...L} />
        <path d="M 750 190 A 60 60 0 0 0 750 310" {...LT} strokeDasharray="6 5" />
        <line x1="940" y1="30" x2="798" y2="30" {...L} />
        <line x1="940" y1="470" x2="798" y2="470" {...L} />
        <path d="M 798 30 A 237.5 237.5 0 0 0 798 470" {...L} />
        <path d="M 888 210 A 40 40 0 0 0 888 290" {...LT} />
        <line x1="897" y1="225" x2="897" y2="275" stroke="white" strokeWidth="3" />
        <circle cx="888" cy="250" r="9" fill="none" stroke="rgba(255,100,50,0.9)" strokeWidth="2.5" />
        {[785,825].map((x,i) => <line key={`rt${i}`} x1={x} y1="157" x2={x} y2="170" stroke="white" strokeWidth="1.5" />)}
        {[785,825].map((x,i) => <line key={`rb${i}`} x1={x} y1="330" x2={x} y2="343" stroke="white" strokeWidth="1.5" />)}
      </g>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface UnifiedCourtProps {
  homeTeam?: string;
  awayTeam?: string;
}

const UnifiedCourt: React.FC<UnifiedCourtProps> = memo(({
  homeTeam = 'LOCAL',
  awayTeam = 'VISITANTE',
}) => {
  const orientation = useCourtLayout();
  const { selectedPlayer, setSelectedPlayer, setActiveTeamFocus } = useUIState();
  const isPortrait = orientation === 'portrait';

  // Portrait: viewBox is 500×940 (rotated); landscape: 940×500
  const viewBox = isPortrait
    ? `0 0 ${COURT_H} ${COURT_W}`
    : `0 0 ${COURT_W} ${COURT_H}`;

  const handlePlayerSelect = (player: CourtPlayer, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent mobile navigation menu trigger
    setSelectedPlayer(player.id, player.team);
  };

  const handleTeamFocus = (team: 'home' | 'away', e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTeamFocus(team);
  };

  const activeSide = selectedPlayer?.team ?? null;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Desktop team labels */}
      <div className="hidden md:flex items-center justify-between px-1">
        <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">● {homeTeam}</span>
        <span className="text-[10px] text-white/30 font-mono">NBA · FULL COURT</span>
        <span className="text-xs font-bold text-red-400 tracking-widest uppercase">{awayTeam} ●</span>
      </div>

      {/* Mobile team focus toggle */}
      <div className="flex md:hidden gap-2 bg-white/5 border border-white/10 rounded-lg p-1 z-10">
        <button
          onClick={(e) => handleTeamFocus('home', e)}
          className={`flex-1 py-2 px-3 rounded font-bold text-xs transition-all ${
            activeSide !== 'away' ? 'bg-blue-500/80 text-white' : 'bg-transparent text-blue-400/70'
          }`}
        >
          🔵 {homeTeam}
        </button>
        <button
          onClick={(e) => handleTeamFocus('away', e)}
          className={`flex-1 py-2 px-3 rounded font-bold text-xs transition-all ${
            activeSide === 'away' ? 'bg-red-500/80 text-white' : 'bg-transparent text-red-400/70'
          }`}
        >
          🔴 {awayTeam}
        </button>
      </div>

      {/* Court SVG — scrollable horizontally on small screens in landscape */}
      <div
        className="w-full rounded-2xl border-2 border-white/10 shadow-2xl overflow-hidden"
        style={isPortrait ? { aspectRatio: `${COURT_H}/${COURT_W}` } : { overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        <svg
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full"
          style={!isPortrait ? { minWidth: '580px' } : undefined}
          preserveAspectRatio="xMidYMid meet"
          aria-label="Cancha de baloncesto completa"
        >
          <CourtMarkings orientation={orientation} />

          {/* Court-space team labels */}
          {!isPortrait && (
            <>
              <text x="235" y="25" textAnchor="middle" fontSize="11" fontWeight="bold"
                fill="rgba(147,197,253,0.8)" fontFamily="system-ui, sans-serif">{homeTeam}</text>
              <text x="705" y="25" textAnchor="middle" fontSize="11" fontWeight="bold"
                fill="rgba(252,165,165,0.8)" fontFamily="system-ui, sans-serif">{awayTeam}</text>
            </>
          )}

          {/* Player nodes */}
          {PLAYERS.map((player) => {
            const rawPos = player.team === 'home' ? HOME_POS[player.position] : AWAY_POS[player.position];
            const pos = isPortrait ? toPortrait(rawPos.x, rawPos.y) : rawPos;
            const isSelected =
              selectedPlayer?.playerId === player.id && selectedPlayer?.team === player.team;

            return (
              <PlayerNode
                key={`${player.team}-${player.id}`}
                jerseyNumber={player.jerseyNumber}
                position={player.position}
                team={player.team}
                cx={pos.x}
                cy={pos.y}
                isSelected={isSelected}
                onSelect={(e) => handlePlayerSelect(player, e)}
              />
            );
          })}
        </svg>
      </div>

      {/* Desktop position legend */}
      <div className="hidden md:grid grid-cols-10 gap-1 text-center text-[9px] mt-1">
        {PLAYERS.map((p) => (
          <div
            key={`leg-${p.team}-${p.id}`}
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
              style={{ color: p.team === 'home' ? '#3B82F6' : '#EF4444' }}
            >
              {p.position}
            </div>
            <div className="text-white/50">#{p.jerseyNumber}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

UnifiedCourt.displayName = 'UnifiedCourt';
export default UnifiedCourt;

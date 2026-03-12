'use client';
import React, { memo } from 'react';
import { FuturisticButton } from '@/ui/FuturisticButton';

// Shared style constants — avoid recreating on each render
const AWAY_STYLE: React.CSSProperties = {
  borderColor: 'rgba(248,113,113,0.35)',
  color: 'rgb(252,165,165)',
};
const AWAY_AND1_STYLE: React.CSSProperties = { borderColor: 'rgba(248,113,113,0.5)' };

const POINTS = [1, 2, 3, 4] as const;

export interface ScoringButtonsProps {
  team: 'home' | 'away';
  label: string;
  onScore: (team: 'home' | 'away', points: number) => void;
}

export const ScoringButtons: React.FC<ScoringButtonsProps> = memo(({ team, label, onScore }) => {
  const isHome = team === 'home';
  return (
    <div className="flex flex-col gap-1.5">
      <h3
        className={`text-[10px] font-bold uppercase tracking-wider ${
          isHome ? 'text-blue-400' : 'text-red-400 text-right'
        }`}
      >
        {isHome ? `🔵 ${label}` : `${label} 🔴`}
      </h3>
      <div className="grid grid-cols-4 gap-1.5">
        {POINTS.map((pts) => (
          <FuturisticButton
            key={pts}
            onClick={() => onScore(team, pts)}
            variant={pts === 4 ? 'neon' : 'glass'}
            className="h-12 text-base font-black"
            style={!isHome ? (pts === 4 ? AWAY_AND1_STYLE : AWAY_STYLE) : undefined}
            title={pts === 4 ? 'And-1' : `+${pts}`}
          >
            +{pts}
          </FuturisticButton>
        ))}
      </div>
    </div>
  );
});

ScoringButtons.displayName = 'ScoringButtons';

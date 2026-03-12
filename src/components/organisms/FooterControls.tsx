'use client';
import React, { memo } from 'react';
import { ScoringButtons } from '@/components/molecules/ScoringButtons';
import { useGameContext } from '@/context/GameContext';

export interface FooterControlsProps {
  homeTeam?: string;
  awayTeam?: string;
  onScoreToast?: (pts: number, label: string) => void;
}

export const FooterControls: React.FC<FooterControlsProps> = memo(({
  homeTeam = 'LOCAL',
  awayTeam = 'VISITANTE',
  onScoreToast,
}) => {
  const { actions } = useGameContext();

  const handleScore = (team: 'home' | 'away', pts: number) => {
    actions.addScore(team, pts);
    onScoreToast?.(pts, team === 'home' ? homeTeam : awayTeam);
  };

  return (
    <footer className="sticky bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-md border-t border-white/10 p-3 md:p-4 z-30">
      <div className="grid grid-cols-2 gap-3">
        <ScoringButtons team="home" label={homeTeam} onScore={handleScore} />
        <ScoringButtons team="away" label={awayTeam} onScore={handleScore} />
      </div>
    </footer>
  );
});

FooterControls.displayName = 'FooterControls';


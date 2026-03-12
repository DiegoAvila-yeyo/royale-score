'use client';
import React from 'react';
import { ScoreDigit } from '@/components/atoms/ScoreDigit';
import { ClockDisplay } from '@/components/atoms/ClockDisplay';
import { PeriodBadge } from '@/components/atoms/PeriodBadge';

export interface ScoreBoardProps {
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  timeLeft: string;
  isRunning: boolean;
  isLastMinute: boolean;
  quarter: number;
  isOT: boolean;
  overtimeNumber: number;
  isTied: boolean;
  onToggleClock: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  homeScore, awayScore, homeTeam, awayTeam,
  timeLeft, isRunning, isLastMinute,
  quarter, isOT, overtimeNumber, isTied,
  onToggleClock,
}) => (
  <div className="flex items-center gap-3 md:gap-4">
    <div className="flex-1">
      <ScoreDigit value={homeScore} team="home" label={homeTeam} />
    </div>

    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <ClockDisplay
        timeLeft={timeLeft}
        isRunning={isRunning}
        isLastMinute={isLastMinute}
        isOT={isOT}
        onClick={onToggleClock}
      />
      <PeriodBadge quarter={quarter} isOT={isOT} overtimeNumber={overtimeNumber} />
      {isTied && !isOT && (
        <span className="text-[9px] text-yellow-400 font-bold animate-pulse">
          🏀 Empate · OT disp.
        </span>
      )}
    </div>

    <div className="flex-1 flex justify-end">
      <ScoreDigit value={awayScore} team="away" label={awayTeam} />
    </div>
  </div>
);

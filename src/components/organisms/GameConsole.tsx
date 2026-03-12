'use client';
import React from 'react';
import { ScoreBoard } from '@/components/molecules/ScoreBoard';
import { ClockControls } from '@/components/molecules/ClockControls';
import { useGameClock } from '@/hooks/useGameClock';
import { useGameContext } from '@/context/GameContext';

interface GameConsoleProps {
  homeTeam?: string;
  awayTeam?: string;
}

export const GameConsole: React.FC<GameConsoleProps> = ({
  homeTeam = 'LOCAL',
  awayTeam = 'VISITANTE',
}) => {
  const { matchState } = useGameContext();
  const {
    timeLeft, isRunning, timeLeftMs,
    toggleClock, resetQuarter, resetMatch, nextQuarter, addOvertime,
  } = useGameClock();

  const isLastMinute = timeLeftMs < 60_000 && timeLeftMs > 0;
  const isOT = matchState.periodType === 'OVERTIME';
  const isTied =
    matchState.currentQuarter === 4 &&
    matchState.homeScore === matchState.awayScore &&
    matchState.gameStatus !== 'pending';

  const containerBg = isOT
    ? 'bg-orange-500/10 border-orange-500/25'
    : isLastMinute
    ? 'bg-red-500/10 border-red-500/25'
    : 'bg-white/5 border-white/10';

  return (
    <div className={`rounded-2xl border backdrop-blur-md p-3 md:p-4 transition-all duration-300 ${containerBg}`}>
      <ScoreBoard
        homeScore={matchState.homeScore}
        awayScore={matchState.awayScore}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        timeLeft={timeLeft}
        isRunning={isRunning}
        isLastMinute={isLastMinute}
        quarter={matchState.currentQuarter}
        isOT={isOT}
        overtimeNumber={matchState.overtimeNumber}
        isTied={isTied}
        onToggleClock={toggleClock}
      />

      <div className="my-3 h-px bg-white/10" />

      <ClockControls
        isRunning={isRunning}
        onToggle={toggleClock}
        onResetPeriod={resetQuarter}
        onNextQuarter={nextQuarter}
        onAddOT={addOvertime}
        onResetMatch={resetMatch}
        disableNextQ={matchState.currentQuarter >= 4 && !isOT}
        disableOT={isOT || matchState.homeScore !== matchState.awayScore}
      />
    </div>
  );
};

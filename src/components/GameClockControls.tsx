'use client';

import React from 'react';
import { useGameClock } from '@/hooks/useGameClock';
import { useGameContext } from '@/context/GameContext';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface GameClockControlsProps {
  onToggleClock: () => void;
  onResetQuarter: () => void;
  onResetMatch: () => void;
  onNextQuarter: () => void;
  onAddOvertime: () => void;
  disableNextQuarter: boolean;
  disableOT: boolean;
  homeTeam?: string;
  awayTeam?: string;
}

const GameClockControls: React.FC<GameClockControlsProps> = ({
  onToggleClock,
  onResetQuarter,
  onResetMatch,
  onNextQuarter,
  onAddOvertime,
  disableNextQuarter,
  disableOT,
  homeTeam = 'LOCAL',
  awayTeam = 'VISITANTE',
}) => {
  const { timeLeft, isRunning, timeLeftMs } = useGameClock();
  const { matchState } = useGameContext();

  const isLastMinute = timeLeftMs < 60_000 && timeLeftMs > 0;
  const isOT = matchState.periodType === 'OVERTIME';
  const isTied =
    matchState.currentQuarter === 4 &&
    matchState.homeScore === matchState.awayScore &&
    matchState.gameStatus !== 'pending';

  const periodLabel = isOT
    ? matchState.overtimeNumber === 1
      ? 'Overtime'
      : `OT${matchState.overtimeNumber}`
    : `Cuarto ${matchState.currentQuarter}`;

  const clockColor = isLastMinute
    ? 'text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]'
    : isOT
    ? 'text-orange-300 drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]'
    : isRunning
    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
    : 'text-red-500 animate-pulse';

  const containerBg = isOT
    ? 'bg-orange-500/10 border-orange-500/25'
    : isLastMinute
    ? 'bg-red-500/10 border-red-500/25'
    : 'bg-white/5 border-white/10';

  return (
    <div
      className={`rounded-2xl border backdrop-blur-md p-3 md:p-4 transition-all duration-300 ${containerBg}`}
    >
      {/* ── Top row: Scores + Clock ── */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* Home score */}
        <div className="flex-1 flex flex-col items-start gap-0.5">
          <span className="text-[10px] md:text-xs font-bold text-blue-400/80 uppercase tracking-widest truncate">
            {homeTeam}
          </span>
          <span className="text-4xl md:text-5xl font-black font-mono text-blue-300 leading-none tabular-nums drop-shadow-[0_0_16px_rgba(96,165,250,0.6)]">
            {matchState.homeScore}
          </span>
        </div>

        {/* Center: Clock + Period */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggleClock}
            className="group flex flex-col items-center gap-0.5 cursor-pointer"
            aria-label={isRunning ? 'Pausar reloj' : 'Iniciar reloj'}
          >
            <span className={`text-3xl md:text-4xl font-mono font-bold tracking-tight ${clockColor}`}>
              {timeLeft}
            </span>
            <span className="text-[9px] md:text-[10px] text-white/40 group-hover:text-white/70 transition-colors uppercase font-semibold tracking-wider">
              {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
            </span>
          </button>

          {/* Period badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
              isOT
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                : 'bg-white/10 border-white/20 text-white/70'
            }`}
          >
            {periodLabel}
          </span>

          {/* Tied warning */}
          {isTied && !isOT && (
            <span className="text-[9px] text-yellow-400 font-bold animate-pulse">
              🏀 Empate · OT disp.
            </span>
          )}
        </div>

        {/* Away score */}
        <div className="flex-1 flex flex-col items-end gap-0.5">
          <span className="text-[10px] md:text-xs font-bold text-red-400/80 uppercase tracking-widest truncate">
            {awayTeam}
          </span>
          <span className="text-4xl md:text-5xl font-black font-mono text-red-300 leading-none tabular-nums drop-shadow-[0_0_16px_rgba(248,113,113,0.6)]">
            {matchState.awayScore}
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="my-3 h-px bg-white/10" />

      {/* ── Control buttons ── */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Play / Pause */}
        <button
          onClick={onToggleClock}
          className={`h-9 px-3 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-1.5 border ${
            isRunning
              ? 'bg-white/10 border-white/20 hover:bg-white/20'
              : 'bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30'
          }`}
          aria-label={isRunning ? 'Pausar' : 'Iniciar'}
        >
          {isRunning ? <Pause size={13} /> : <Play size={13} />}
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>

        {/* Reset Period */}
        <button
          onClick={onResetQuarter}
          className="h-9 px-3 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-1.5 border bg-white/8 border-white/20 hover:bg-white/15 text-white/80"
          aria-label="Reiniciar período"
          title="Reiniciar tiempo del período actual"
        >
          <RotateCcw size={13} />
          Reset P.
        </button>

        {/* Next Quarter */}
        <button
          onClick={onNextQuarter}
          disabled={disableNextQuarter}
          className={`h-9 px-3 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-1.5 border ${
            disableNextQuarter
              ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              : 'bg-white/8 border-white/20 hover:bg-white/15 text-white/80'
          }`}
          aria-label="Siguiente cuarto"
        >
          <SkipForward size={13} />
          Sig. Q
        </button>

        {/* OT */}
        <button
          onClick={onAddOvertime}
          disabled={disableOT}
          className={`h-9 px-3 rounded-lg font-bold text-xs uppercase transition-all border ${
            disableOT
              ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 hover:shadow-[0_0_12px_rgba(234,179,8,0.4)]'
          }`}
          aria-label="Agregar overtime"
          title="Agregar tiempo extra (solo en empate)"
        >
          🏀 OT
        </button>

        {/* Reset Match */}
        <button
          onClick={onResetMatch}
          className="h-9 px-3 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-1.5 border bg-red-500/10 border-red-500/25 text-red-400/80 hover:bg-red-500/20"
          aria-label="Reiniciar partido"
          title="Reiniciar partido completo"
        >
          <RotateCcw size={13} />
          Reset M.
        </button>
      </div>
    </div>
  );
};

export default GameClockControls;

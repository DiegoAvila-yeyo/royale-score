'use client';
import React from 'react';

interface ClockDisplayProps {
  timeLeft: string;
  isRunning: boolean;
  isLastMinute: boolean;
  isOT: boolean;
  onClick?: () => void;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  timeLeft, isRunning, isLastMinute, isOT, onClick,
}) => {
  const colorClass = isLastMinute
    ? 'text-red-400 drop-shadow-[0_0_14px_rgba(239,68,68,0.8)] animate-pulse'
    : isOT
    ? 'text-orange-300 drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]'
    : isRunning
    ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]'
    : 'text-red-500 animate-pulse';

  return (
    <button
      onClick={onClick}
      className={`font-mono font-bold tracking-tight text-3xl md:text-4xl transition-all cursor-pointer ${colorClass}`}
      aria-label={isRunning ? 'Pausar reloj' : 'Iniciar reloj'}
    >
      {timeLeft}
    </button>
  );
};

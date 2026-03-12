'use client';
import React from 'react';

interface ScoreDigitProps {
  value: number;
  team: 'home' | 'away';
  label: string;
}

export const ScoreDigit: React.FC<ScoreDigitProps> = ({ value, team, label }) => {
  const colorClass =
    team === 'home'
      ? 'text-blue-300 drop-shadow-[0_0_18px_rgba(96,165,250,0.6)]'
      : 'text-red-300 drop-shadow-[0_0_18px_rgba(248,113,113,0.6)]';
  const labelClass = team === 'home' ? 'text-blue-400/80' : 'text-red-400/80';
  const alignClass = team === 'home' ? 'items-start' : 'items-end';

  return (
    <div className={`flex flex-col ${alignClass}`}>
      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest truncate max-w-[80px] ${labelClass}`}>
        {label}
      </span>
      <span className={`text-4xl md:text-5xl font-black font-mono leading-none tabular-nums ${colorClass}`}>
        {value}
      </span>
    </div>
  );
};

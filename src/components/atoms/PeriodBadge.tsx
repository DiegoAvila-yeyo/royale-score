'use client';
import React from 'react';

interface PeriodBadgeProps {
  quarter: number;
  isOT: boolean;
  overtimeNumber: number;
}

export const PeriodBadge: React.FC<PeriodBadgeProps> = ({ quarter, isOT, overtimeNumber }) => {
  const label = isOT
    ? overtimeNumber === 1 ? 'OT' : `OT${overtimeNumber}`
    : `Q${quarter}`;
  const classes = isOT
    ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
    : 'bg-white/10 border-white/20 text-white/70';

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${classes}`}
    >
      {label}
    </span>
  );
};

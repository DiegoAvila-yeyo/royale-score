'use client';
import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'active' | 'danger' | 'ot';
}

const Btn: React.FC<BtnProps> = ({ variant = 'default', className = '', ...rest }) => {
  const base = 'h-9 px-3 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-1.5 border';
  const variants: Record<string, string> = {
    default: 'bg-white/8 border-white/20 hover:bg-white/15 text-white/80',
    active:  'bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30',
    danger:  'bg-red-500/10  border-red-500/25  text-red-400/80 hover:bg-red-500/20',
    ot:      'bg-yellow-500/20 border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 hover:shadow-[0_0_10px_rgba(234,179,8,0.4)]',
  };
  return (
    <button
      className={`${base} ${variants[variant]} disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
      {...rest}
    />
  );
};

export interface ClockControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onResetPeriod: () => void;
  onNextQuarter: () => void;
  onAddOT: () => void;
  onResetMatch: () => void;
  disableNextQ: boolean;
  disableOT: boolean;
}

export const ClockControls: React.FC<ClockControlsProps> = ({
  isRunning, onToggle, onResetPeriod, onNextQuarter,
  onAddOT, onResetMatch, disableNextQ, disableOT,
}) => (
  <div className="flex items-center justify-center gap-2 flex-wrap">
    <Btn variant={isRunning ? 'default' : 'active'} onClick={onToggle}>
      {isRunning ? <Pause size={13} /> : <Play size={13} />}
      {isRunning ? 'Pausar' : 'Iniciar'}
    </Btn>

    <Btn onClick={onResetPeriod} title="Reiniciar tiempo del período">
      <RotateCcw size={13} /> Reset P.
    </Btn>

    <Btn onClick={onNextQuarter} disabled={disableNextQ} title="Siguiente cuarto">
      <SkipForward size={13} /> Sig. Q
    </Btn>

    <Btn variant="ot" onClick={onAddOT} disabled={disableOT} title="Agregar overtime (solo en empate)">
      🏀 OT
    </Btn>

    <Btn variant="danger" onClick={onResetMatch} title="Reiniciar partido completo">
      <RotateCcw size={13} /> Reset M.
    </Btn>
  </div>
);

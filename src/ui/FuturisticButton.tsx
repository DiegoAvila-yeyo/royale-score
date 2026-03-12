import React from 'react';
import { UI_TOKENS } from '@/styles/tokens';

interface FuturisticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'glass' | 'neon';
  children: React.ReactNode;
}

export const FuturisticButton = ({ variant = 'glass', children, className, ...props }: FuturisticButtonProps) => {
  const variantStyles = {
    glass: `${UI_TOKENS.glass} hover:bg-white/10 text-white`,
    neon: "bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
  };

  return (
    <button 
      className={`${UI_TOKENS.buttonMain} px-4 py-2 flex items-center justify-center gap-2 font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
'use client';
import React from 'react';

const HOME_COLOR = '#3B82F6';
const AWAY_COLOR = '#EF4444';

export interface PlayerNodeProps {
  jerseyNumber: number;
  position: string;
  team: 'home' | 'away';
  cx: number;
  cy: number;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

/** Pure SVG atom — must be rendered inside an <svg> element. */
export const PlayerNode: React.FC<PlayerNodeProps> = ({
  jerseyNumber, position, team, cx, cy, isSelected, onSelect,
}) => {
  const color = team === 'home' ? HOME_COLOR : AWAY_COLOR;
  const fontSize = jerseyNumber >= 10 ? '11' : '13';

  return (
    <g
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={`Jugador ${jerseyNumber} ${position}`}
    >
      {/* Large invisible hit area for easy mobile tapping */}
      <circle cx={cx} cy={cy} r={34} fill="transparent" />

      {isSelected && (
        <>
          <circle cx={cx} cy={cy} r={26} fill="none" stroke={color} strokeWidth="2.5"
            opacity="0.9" filter="url(#playerGlow)" />
          <circle cx={cx} cy={cy} r={30} fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
        </>
      )}

      <circle
        cx={cx} cy={cy} r={20}
        fill={isSelected ? color : `${color}cc`}
        stroke="white"
        strokeWidth={isSelected ? 2.5 : 1.5}
        filter={isSelected ? 'url(#playerGlow)' : undefined}
      />

      <text
        x={cx} y={cy}
        textAnchor="middle" dominantBaseline="central"
        fontSize={fontSize} fontWeight="900" fill="white"
        fontFamily="system-ui, Arial, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {jerseyNumber}
      </text>

      <text
        x={cx} y={cy + 29}
        textAnchor="middle"
        fontSize="8.5" fontWeight="bold"
        fill={isSelected ? color : 'rgba(255,255,255,0.65)'}
        fontFamily="system-ui, Arial, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {position}
      </text>
    </g>
  );
};

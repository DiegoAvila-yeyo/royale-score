'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TeamStats {
  fgPct: number;
  fg3pPct: number;
  ftPct: number;
  totalRebounds: number;
  totalAssists: number;
  totalTurnovers: number;
  totalFouls: number;
}

interface TeamStatsPanelProps {
  homeStats: TeamStats;
  awayStats: TeamStats;
}

interface StatRowProps {
  label: string;
  homeValue: number | string;
  awayValue: number | string;
  isPercentage?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, homeValue, awayValue, isPercentage = false }) => {
  const homeNum = typeof homeValue === 'string' ? parseFloat(homeValue) : homeValue;
  const awayNum = typeof awayValue === 'string' ? parseFloat(awayValue) : awayValue;
  const homeWins = homeNum > awayNum;

  return (
    <div className="flex items-center justify-between py-2 px-3 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/60 flex-1">{label}</span>
      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className={`text-sm font-bold flex items-center gap-1 ${homeWins ? 'text-blue-400' : 'text-white/40'}`}>
          {isPercentage ? `${homeNum.toFixed(1)}%` : homeNum}
          {homeWins && <ArrowUp size={12} />}
        </div>
        <span className="text-white/30 text-xs w-4">vs</span>
        <div className={`text-sm font-bold flex items-center gap-1 ${!homeWins ? 'text-red-400' : 'text-white/40'}`}>
          {!homeWins && <ArrowUp size={12} />}
          {isPercentage ? `${awayNum.toFixed(1)}%` : awayNum}
        </div>
      </div>
    </div>
  );
};

const TeamStatsPanel: React.FC<TeamStatsPanelProps> = ({ homeStats, awayStats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Home Team Stats */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-bold text-blue-400 mb-3 uppercase">Local Team Stats</h3>
        <StatRow label="FG %" homeValue={homeStats.fgPct} awayValue={awayStats.fgPct} isPercentage />
        <StatRow label="3P %" homeValue={homeStats.fg3pPct} awayValue={awayStats.fg3pPct} isPercentage />
        <StatRow label="FT %" homeValue={homeStats.ftPct} awayValue={awayStats.ftPct} isPercentage />
        <StatRow label="Rebounds" homeValue={homeStats.totalRebounds} awayValue={awayStats.totalRebounds} />
        <StatRow label="Assists" homeValue={homeStats.totalAssists} awayValue={awayStats.totalAssists} />
        <StatRow label="Turnovers" homeValue={homeStats.totalTurnovers} awayValue={awayStats.totalTurnovers} />
        <StatRow label="Fouls" homeValue={homeStats.totalFouls} awayValue={awayStats.totalFouls} />
      </div>

      {/* Efficiency & Comparison Panel */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-bold text-white mb-3 uppercase">Team Comparison</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-white/60 mb-2">Shooting Efficiency</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-blue-500/20 rounded h-2" style={{ width: `${homeStats.fgPct}%` }} />
              <span className="text-xs font-bold text-blue-400">{homeStats.fgPct.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-red-500/20 rounded h-2" style={{ width: `${awayStats.fgPct}%` }} />
              <span className="text-xs font-bold text-red-400">{awayStats.fgPct.toFixed(1)}%</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-white/60 mb-2">Ball Control (Lower is Better)</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400">{homeStats.totalTurnovers}</span>
              <div className="flex-1 bg-blue-500/20 rounded h-2" style={{ width: `${Math.min(homeStats.totalTurnovers * 10, 100)}%` }} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-red-400">{awayStats.totalTurnovers}</span>
              <div className="flex-1 bg-red-500/20 rounded h-2" style={{ width: `${Math.min(awayStats.totalTurnovers * 10, 100)}%` }} />
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-[10px] text-white/50 text-center italic">
              Click on player names for detailed analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamStatsPanel;

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface PredictionData {
  homeWinProbability: number;
  homeMomentum: 'hot' | 'cold' | 'neutral';
  awayMomentum: 'hot' | 'cold' | 'neutral';
  homeProjectedFinalScore: number;
  awayProjectedFinalScore: number;
  homeTrendPoints: string;
  awayTrendPoints: string;
}

interface PredictionPanelProps {
  data: PredictionData;
  isLiveGame: boolean;
}

const MomentumBadge: React.FC<{ trend: 'hot' | 'cold' | 'neutral' }> = ({ trend }) => {
  if (trend === 'hot') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-[11px] font-bold text-orange-400">
        <Zap size={12} />
        Hot Streak
      </div>
    );
  }
  if (trend === 'cold') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-[11px] font-bold text-blue-400">
        ❄️ Cold Streak
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[11px] font-bold text-white/60">
      ▬ Neutral
    </div>
  );
};

const PredictionPanel: React.FC<PredictionPanelProps> = ({ data, isLiveGame }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-bold text-white uppercase">Game Trends & Projections</h3>

      {/* Win Probability */}
      {isLiveGame && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/60">Current Win Probability</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-400">{data.homeWinProbability.toFixed(0)}%</span>
              <span className="text-xs text-white/40">Local</span>
            </div>
          </div>
          <div className="w-full h-6 bg-white/5 rounded-full overflow-hidden border border-white/10 flex">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
              style={{ width: `${data.homeWinProbability}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all"
              style={{ width: `${100 - data.homeWinProbability}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>Favored</span>
            <span>{(100 - data.homeWinProbability).toFixed(0)}% Visitante</span>
          </div>
        </div>
      )}

      {/* Team Momentum */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-blue-400 font-bold mb-2 uppercase">Local Momentum</p>
          <MomentumBadge trend={data.homeMomentum} />
          <p className="text-[10px] text-white/60 mt-2">{data.homeTrendPoints}</p>
        </div>
        <div>
          <p className="text-xs text-red-400 font-bold mb-2 uppercase">Visitante Momentum</p>
          <MomentumBadge trend={data.awayMomentum} />
          <p className="text-[10px] text-white/60 mt-2">{data.awayTrendPoints}</p>
        </div>
      </div>

      {/* Projected Final Score */}
      {isLiveGame && (
        <div className="border-t border-white/10 pt-3">
          <p className="text-xs text-white/60 mb-2">If current pace continues...</p>
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-xs text-blue-400 font-bold uppercase mb-1">Projected Local</p>
              <p className="text-2xl font-black text-blue-400">{data.homeProjectedFinalScore}</p>
            </div>
            <div className="text-white/30 text-sm font-bold">vs</div>
            <div className="text-center flex-1">
              <p className="text-xs text-red-400 font-bold uppercase mb-1">Projected Visitante</p>
              <p className="text-2xl font-black text-red-400">{data.awayProjectedFinalScore}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="bg-white/5 border border-white/10 rounded px-3 py-2 text-[9px] text-white/50">
        📊 Projections based on current game pace. Updates live every minute during game.
      </div>
    </div>
  );
};

export default PredictionPanel;

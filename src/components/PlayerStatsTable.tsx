'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Extended player stats with ID info
interface PlayerStatsWithId {
  playerId: number;
  team: 'home' | 'away';
  pointsScored: number;
  fouls: number;
  steals: number;
  assists: number;
  blocks: number;
  rebounds: number;
  [key: string]: any;
}

interface PlayerStatsTableProps {
  homeStats: PlayerStatsWithId[];
  awayStats: PlayerStatsWithId[];
}

type SortKey = 'pointsScored' | 'fouls' | 'steals' | 'assists' | 'blocks' | 'rebounds';

const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({ homeStats, awayStats }) => {
  const [sortKey, setSortKey] = useState<SortKey>('pointsScored');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortStats = (stats: PlayerStatsWithId[]) => {
    const sorted = [...stats].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  };

  const SortHeader: React.FC<{ label: string; key: SortKey }> = ({ label, key }) => (
    <button
      onClick={() => handleSort(key)}
      className="flex items-center gap-1 hover:text-white/80 transition-colors"
    >
      {label}
      {sortKey === key && (sortOrder === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Home Team Stats */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-bold text-blue-400 mb-3 uppercase">Local Players</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="text-left py-2 px-1">#</th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Pts" key="pointsScored" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Reb" key="rebounds" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Ast" key="assists" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Stl" key="steals" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Blk" key="blocks" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Fls" key="fouls" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortStats(homeStats).map((player) => (
                <tr key={player.playerId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-1 font-bold text-blue-400">{player.playerId}</td>
                  <td className="text-right py-2 px-1 font-semibold">{player.pointsScored}</td>
                  <td className="text-right py-2 px-1">{player.rebounds}</td>
                  <td className="text-right py-2 px-1">{player.assists}</td>
                  <td className="text-right py-2 px-1">{player.steals}</td>
                  <td className="text-right py-2 px-1">{player.blocks}</td>
                  <td className="text-right py-2 px-1 text-yellow-400">{player.fouls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Away Team Stats */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-bold text-red-400 mb-3 uppercase">Visitante Players</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="text-left py-2 px-1">#</th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Pts" key="pointsScored" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Reb" key="rebounds" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Ast" key="assists" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Stl" key="steals" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Blk" key="blocks" />
                </th>
                <th className="text-right py-2 px-1 cursor-pointer">
                  <SortHeader label="Fls" key="fouls" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortStats(awayStats).map((player) => (
                <tr key={player.playerId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-1 font-bold text-red-400">{player.playerId}</td>
                  <td className="text-right py-2 px-1 font-semibold">{player.pointsScored}</td>
                  <td className="text-right py-2 px-1">{player.rebounds}</td>
                  <td className="text-right py-2 px-1">{player.assists}</td>
                  <td className="text-right py-2 px-1">{player.steals}</td>
                  <td className="text-right py-2 px-1">{player.blocks}</td>
                  <td className="text-right py-2 px-1 text-yellow-400">{player.fouls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsTable;

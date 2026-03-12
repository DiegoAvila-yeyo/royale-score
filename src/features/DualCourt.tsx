"use client";

import React from 'react';
import { usePlayers, useUIState } from '@/context/GameContext';
import { PlayerId } from '@/types/gameEngine';
import Court from './Court';

const DualCourt: React.FC = () => {
  const { homeTeam, awayTeam } = usePlayers();
  const { selectedPlayer, setSelectedPlayer } = useUIState();

  // Example player data - this would come from gameState/rosters
  const homePlayers = [
    { id: 1 as PlayerId, jerseyNumber: 1, position: 'PG' as const, stats: { pointsScored: 12, fouls: 1 } },
    { id: 2 as PlayerId, jerseyNumber: 2, position: 'SG' as const, stats: { pointsScored: 8, fouls: 0 } },
    { id: 3 as PlayerId, jerseyNumber: 3, position: 'SF' as const, stats: { pointsScored: 15, fouls: 2 } },
    { id: 4 as PlayerId, jerseyNumber: 4, position: 'PF' as const, stats: { pointsScored: 10, fouls: 1 } },
    { id: 5 as PlayerId, jerseyNumber: 5, position: 'C' as const, stats: { pointsScored: 20, fouls: 3 } },
  ];

  const awayPlayers = [
    { id: 6 as PlayerId, jerseyNumber: 6, position: 'PG' as const, stats: { pointsScored: 14, fouls: 2 } },
    { id: 7 as PlayerId, jerseyNumber: 7, position: 'SG' as const, stats: { pointsScored: 18, fouls: 1 } },
    { id: 8 as PlayerId, jerseyNumber: 8, position: 'SF' as const, stats: { pointsScored: 11, fouls: 0 } },
    { id: 9 as PlayerId, jerseyNumber: 9, position: 'PF' as const, stats: { pointsScored: 9, fouls: 4 } },
    { id: 10 as PlayerId, jerseyNumber: 10, position: 'C' as const, stats: { pointsScored: 16, fouls: 2 } },
  ];

  return (
    <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0">
      {/* Main Court Container */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1">
        {/* Home Team Court */}
        <div className="w-full md:w-1/2">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-blue-400">LOCAL</h3>
          </div>
          <Court
            team="home"
            players={homePlayers}
            selectedPlayerId={selectedPlayer?.team === 'home' ? selectedPlayer.playerId : null}
            onPlayerSelect={(id) => setSelectedPlayer(id, 'home')}
            teamColor="#3B82F6"
          />
        </div>

        {/* Away Team Court - Hidden on Mobile */}
        <div className="hidden md:flex w-full md:w-1/2 flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-red-400">VISITANTE</h3>
          </div>
          <Court
            team="away"
            players={awayPlayers}
            selectedPlayerId={selectedPlayer?.team === 'away' ? selectedPlayer.playerId : null}
            onPlayerSelect={(id) => setSelectedPlayer(id, 'away')}
            teamColor="#EF4444"
          />
        </div>
      </div>

      {/* Mobile-only: Team toggle + second court */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Team Selector on Mobile */}
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setSelectedPlayer(1, 'home')}
            className={`flex-1 py-2 px-3 rounded font-bold text-xs transition-all ${
              selectedPlayer?.team === 'home'
                ? 'bg-blue-500/80 text-white'
                : 'bg-white/0 text-blue-400'
            }`}
          >
            LOCAL
          </button>
          <button
            onClick={() => setSelectedPlayer(6, 'away')}
            className={`flex-1 py-2 px-3 rounded font-bold text-xs transition-all ${
              selectedPlayer?.team === 'away'
                ? 'bg-red-500/80 text-white'
                : 'bg-white/0 text-red-400'
            }`}
          >
            VISITANTE
          </button>
        </div>

        {/* Away court shown on mobile only */}
        {selectedPlayer?.team === 'away' && (
          <div>
            <div className="mb-2">
              <h3 className="text-sm font-bold text-red-400">VISITANTE</h3>
            </div>
            <Court
              team="away"
              players={awayPlayers}
              selectedPlayerId={selectedPlayer.playerId}
              onPlayerSelect={(id) => setSelectedPlayer(id, 'away')}
              teamColor="#EF4444"
            />
          </div>
        )}
      </div>

      {/* Legend - Desktop only */}
      <div className="hidden md:grid grid-cols-10 gap-2 text-center text-[10px] mt-4">
        {/* Home team legend */}
        {homePlayers.slice(0, 5).map((player) => (
          <div
            key={`home-${player.id}`}
            className={`py-2 px-1 rounded-lg transition-all ${
              selectedPlayer?.playerId === player.id && selectedPlayer?.team === 'home'
                ? 'bg-blue-500/20 border border-blue-400/50'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="font-bold text-xs text-blue-400">{player.position}</div>
            <div className="text-[9px] text-white/60">#{player.jerseyNumber}</div>
          </div>
        ))}

        {/* Away team legend */}
        {awayPlayers.slice(0, 5).map((player) => (
          <div
            key={`away-${player.id}`}
            className={`py-2 px-1 rounded-lg transition-all ${
              selectedPlayer?.playerId === player.id && selectedPlayer?.team === 'away'
                ? 'bg-red-500/20 border border-red-400/50'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="font-bold text-xs text-red-400">{player.position}</div>
            <div className="text-[9px] text-white/60">#{player.jerseyNumber}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DualCourt;

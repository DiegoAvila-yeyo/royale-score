"use client";

import React, { useState, useEffect } from 'react';
import { useGameContext, useEventLog, useUIState } from '@/context/GameContext';
import { useGameClock } from '@/hooks/useGameClock';
import { useToast } from '@/hooks/useToast';
import UnifiedCourt from '@/features/UnifiedCourt';
import ActionModal from '@/components/ActionModal';
import EventLog from '@/components/EventLog';
import GameClockControls from '@/components/GameClockControls';
import ToastContainer from '@/components/ToastContainer';
import { FuturisticButton } from '@/ui/FuturisticButton';
import { RotateCcw } from 'lucide-react';

export default function RoyaleScoreMain() {
  const { matchState, actions } = useGameContext();
  const { events, canUndo, undoLastAction } = useEventLog();
  const { selectedPlayer } = useUIState();
  const { toasts, addToast, removeToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const {
    isRunning,
    toggleClock,
    resetQuarter,
    resetMatch,
    nextQuarter,
    addOvertime,
  } = useGameClock();

  // Open action modal when a player is selected
  useEffect(() => {
    if (selectedPlayer && selectedPlayer.playerId > 0) {
      setModalOpen(true);
    }
  }, [selectedPlayer]);

  // Toast handler for scoring buttons
  const handleAddScore = (team: 'home' | 'away', pts: number) => {
    actions.addScore(team, pts);
    const teamLabel = team === 'home' ? matchState.homeTeam.name || 'LOCAL' : matchState.awayTeam.name || 'VISITANTE';
    const icon = pts === 3 ? '🎯' : pts === 1 ? '🏀' : '⛹️';
    addToast(`+${pts} • ${teamLabel}`, 'success', icon, 2000);
  };

  const homeLabel = matchState.homeTeam.name || 'LOCAL';
  const awayLabel  = matchState.awayTeam.name  || 'VISITANTE';

  return (
    <main
      className="min-h-screen bg-neutral-950 text-white flex flex-col p-3 md:p-6 gap-3 md:gap-4"
      style={{ overscrollBehavior: 'none' }}
    >
      {/* ── Unified Scoreboard + Clock Console ── */}
      <GameClockControls
        onToggleClock={toggleClock}
        onResetQuarter={resetQuarter}
        onResetMatch={resetMatch}
        onNextQuarter={nextQuarter}
        onAddOvertime={addOvertime}
        disableNextQuarter={matchState.currentQuarter >= 4 && matchState.periodType === 'REGULATION'}
        disableOT={matchState.periodType === 'OVERTIME' || matchState.homeScore !== matchState.awayScore}
        homeTeam={homeLabel}
        awayTeam={awayLabel}
      />

      {/* ── Main Content: Court + Event Log ── */}
      <section className="flex gap-3 md:gap-4 flex-1 min-h-0">
        {/* Full court visualization */}
        <div className="flex-1 min-w-0">
          <UnifiedCourt homeTeam={homeLabel} awayTeam={awayLabel} />
        </div>

        {/* Event log sidebar */}
        <aside className="w-16 md:w-20 flex flex-col gap-2 overflow-y-auto shrink-0">
          <EventLog />
          <button
            onClick={undoLastAction}
            disabled={!canUndo}
            className={`h-10 flex items-center justify-center rounded-lg border transition-all ${
              canUndo
                ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
                : 'border-white/5 text-neutral-600'
            }`}
            title="Deshacer última acción"
            aria-label="Deshacer"
          >
            <RotateCcw size={16} />
          </button>
        </aside>
      </section>

      {/* ── Footer: Scoring Controls ── */}
      <footer className="sticky bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-md border-t border-white/10 p-3 md:p-4 z-30">
        <div className="grid grid-cols-2 gap-3">
          {/* Home Team Buttons */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              🔵 {homeLabel}
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3].map((pts) => (
                <FuturisticButton
                  key={`home-${pts}`}
                  onClick={() => handleAddScore('home', pts)}
                  className="h-12 text-base font-black"
                >
                  +{pts}
                </FuturisticButton>
              ))}
              <FuturisticButton
                onClick={() => handleAddScore('home', 4)}
                variant="neon"
                className="h-12 text-xs font-black"
                title="And-1"
              >
                +4
              </FuturisticButton>
            </div>
          </div>

          {/* Away Team Buttons */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider text-right">
              {awayLabel} 🔴
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3].map((pts) => (
                <FuturisticButton
                  key={`away-${pts}`}
                  onClick={() => handleAddScore('away', pts)}
                  className="h-12 text-base font-black"
                  style={{ borderColor: 'rgba(248,113,113,0.35)', color: 'rgb(252,165,165)' }}
                >
                  +{pts}
                </FuturisticButton>
              ))}
              <FuturisticButton
                onClick={() => handleAddScore('away', 4)}
                variant="neon"
                className="h-12 text-xs font-black"
                style={{ borderColor: 'rgba(248,113,113,0.5)' }}
                title="And-1"
              >
                +4
              </FuturisticButton>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Action Modal ── */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onActionRecorded={(label, playerNum, team) => {
          const icon = label === 'Falta' ? '🚫' : label === 'Robo' ? '🎯' : label === 'Tapón' ? '🛡️' : label === 'Asist' ? '🤝' : '��';
          const teamLabel = team === 'home' ? homeLabel : awayLabel;
          addToast(`#${playerNum} ${label} · ${teamLabel}`, 'info', icon);
        }}
      />

      {/* ── Toast Notifications ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

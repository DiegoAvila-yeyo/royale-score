"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useUIState } from '@/context/GameContext';
import { useToast } from '@/hooks/useToast';
import { GameConsole } from '@/components/organisms/GameConsole';
import { FooterControls } from '@/components/organisms/FooterControls';
import { EventLogPanel } from '@/components/organisms/EventLogPanel';
import UnifiedCourt from '@/features/UnifiedCourt';
import ActionModal from '@/components/ActionModal';
import ToastContainer from '@/components/ToastContainer';

const HOME_TEAM = 'LOCAL';
const AWAY_TEAM = 'VISITANTE';

const ACTION_ICONS: Record<string, string> = {
  Falta: '🚫', Robo: '🎯', Asist: '🤝', Tapón: '🛡️',
  Rebound: '📦', Turnover: '💥', Timeout: '⏸️', Puntos: '🏀',
};

export default function RoyaleScoreMain() {
  const { selectedPlayer } = useUIState();
  const { toasts, addToast, removeToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  // Open action modal when a player is selected
  useEffect(() => {
    if (selectedPlayer?.playerId) setModalOpen(true);
  }, [selectedPlayer]);

  const handleScoreToast = useCallback((pts: number, label: string) => {
    const icon = pts === 3 ? '🎯' : pts === 1 ? '🏀' : '⛹️';
    addToast(`+${pts} · ${label}`, 'success', icon, 1800);
  }, [addToast]);

  const handleActionToast = useCallback(
    (label: string, playerNum: number, team: 'home' | 'away') => {
      const teamLabel = team === 'home' ? HOME_TEAM : AWAY_TEAM;
      addToast(`#${playerNum} ${label} · ${teamLabel}`, 'info', ACTION_ICONS[label] ?? '📊');
    },
    [addToast],
  );

  return (
    <main
      className="min-h-screen bg-neutral-950 text-white flex flex-col p-3 md:p-6 gap-3 md:gap-4"
      style={{ overscrollBehavior: 'none' }}
    >
      {/* ── Unified Scoreboard + Clock Console ── */}
      <GameConsole homeTeam={HOME_TEAM} awayTeam={AWAY_TEAM} />

      {/* ── Court + Event Log ── */}
      <section className="flex gap-3 md:gap-4 flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          <UnifiedCourt homeTeam={HOME_TEAM} awayTeam={AWAY_TEAM} />
        </div>

        <aside className="w-16 md:w-20 flex flex-col gap-2 overflow-y-auto shrink-0">
          <EventLogPanel />
        </aside>
      </section>

      {/* ── Sticky Scoring Footer ── */}
      <FooterControls
        homeTeam={HOME_TEAM}
        awayTeam={AWAY_TEAM}
        onScoreToast={handleScoreToast}
      />

      {/* ── Action Modal ── */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onActionRecorded={handleActionToast}
      />

      {/* ── Toast Stack ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

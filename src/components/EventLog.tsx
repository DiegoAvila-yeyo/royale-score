'use client';

import React from 'react';
import { useEventLog, useGameContext } from '@/context/GameContext';
import EventLogCard from './EventLogCard';

const EventLog: React.FC = () => {
  const { events, canUndo, undoLastAction } = useEventLog();
  const { actions, matchState } = useGameContext();

  const handleUndo = (event: React.SetStateAction<typeof events[0] | null>) => {
    undoLastAction();
  };

  // Show last 10 events in reverse chronological order
  const displayedEvents = events.slice(-10).reverse();

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-lg p-2 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[9px] font-bold text-white/60 uppercase tracking-wider">
          Event Log ({events.length})
        </h3>
        <span className="text-[9px] text-white/40">
          {matchState.currentQuarter ? `Q${matchState.currentQuarter}` : '—'}
        </span>
      </div>

      {/* Events Container */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {displayedEvents.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-[9px] text-white/40">
            No events recorded yet
          </div>
        ) : (
          displayedEvents.map((event) => (
            <EventLogCard
              key={event.eventId}
              event={event}
              onUndo={handleUndo}
              canUndo={canUndo}
            />
          ))
        )}
      </div>

      {/* Undo All Button (compact) */}
      {events.length > 0 && (
        <button
          onClick={undoLastAction}
          disabled={!canUndo}
          className={`text-[8px] px-2 py-1 rounded border transition-all uppercase font-bold ${
            canUndo
              ? 'border-yellow-500/30 text-yellow-500/70 hover:bg-yellow-500/10 hover:border-yellow-400/50'
              : 'border-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          ↶ Undo Last
        </button>
      )}
    </div>
  );
};

export default EventLog;

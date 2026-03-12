'use client';
import React, { memo } from 'react';
import { useEventLog, useGameContext } from '@/context/GameContext';
import { EventLogItem } from '@/components/molecules/EventLogItem';

export const EventLogPanel: React.FC = memo(() => {
  const { events, canUndo, undoLastAction } = useEventLog();
  const { matchState } = useGameContext();

  const displayed = events.slice(-12).reverse();

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-lg p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
          Log ({events.length})
        </h3>
        <span className="text-[9px] text-white/30 font-mono">
          Q{matchState.currentQuarter}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {displayed.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-[9px] text-white/30">
            Sin eventos
          </div>
        ) : (
          displayed.map((evt) => (
            <EventLogItem
              key={evt.eventId}
              event={evt}
              onUndo={undoLastAction}
              canUndo={canUndo}
            />
          ))
        )}
      </div>

      {events.length > 0 && (
        <button
          onClick={undoLastAction}
          disabled={!canUndo}
          className={`text-[8px] px-2 py-1 rounded border transition-all uppercase font-bold ${
            canUndo
              ? 'border-yellow-500/30 text-yellow-500/70 hover:bg-yellow-500/10'
              : 'border-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          ↶ Deshacer
        </button>
      )}
    </div>
  );
});

EventLogPanel.displayName = 'EventLogPanel';

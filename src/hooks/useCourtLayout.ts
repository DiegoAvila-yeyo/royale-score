'use client';
import { useState, useEffect } from 'react';

export type CourtOrientation = 'landscape' | 'portrait';

/**
 * Detects viewport orientation.
 * Returns 'portrait' on narrow screens in portrait mode (mobile),
 * 'landscape' on desktop or landscape mobile.
 */
export const useCourtLayout = (): CourtOrientation => {
  const [orientation, setOrientation] = useState<CourtOrientation>('landscape');

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait) and (max-width: 768px)');
    const update = (e: MediaQueryList | MediaQueryListEvent) => {
      setOrientation(e.matches ? 'portrait' : 'landscape');
    };
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return orientation;
};

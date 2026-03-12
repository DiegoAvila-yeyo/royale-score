import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialMinutes: number = 10) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isPaused, setIsPaused] = useState(true);
  const [quarter, setQuarter] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsPaused(true);
    }
    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  const togglePause = () => setIsPaused(!isPaused);
  
  const resetTimer = useCallback((mins: number = 10) => {
    setTimeLeft(mins * 60);
    setIsPaused(true);
  }, []);

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return { timeLeft, isPaused, quarter, formatTime, togglePause, setQuarter, resetTimer };
};